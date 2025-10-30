import { scanRoutes } from '../utils/fileScanner.js'
import path from 'path'
import { pathToFileURL } from 'url'
import type { LoadedRoute, RouteModule } from './route.js'
import HypeRequest from './request.js'
import { HypeResponseLike } from './response.js'

import { MiddlewareChain, MiddlewareFunction } from './middleware.js'
import type { RouteHandler} from './route.js'

export class Router {
  routes: LoadedRoute[] = []
  private globalMiddleware: MiddlewareChain
  private routeMiddleware: Map<string, MiddlewareChain>

  constructor() {
    this.globalMiddleware = new MiddlewareChain()
    this.routeMiddleware = new Map()
  }

  use(middleware: any): Router
  use(path: string, middleware: any): Router
  use(pathOrMiddleware: string | any, maybeMiddleware?: any): Router {
    if (typeof pathOrMiddleware === 'string') {
      const path = pathOrMiddleware
      const middleware = maybeMiddleware
      if (!this.routeMiddleware.has(path)) {
        this.routeMiddleware.set(path, new MiddlewareChain())
      }
      this.routeMiddleware.get(path)?.use(middleware)
    } else {
      this.globalMiddleware.use(pathOrMiddleware)
    }
    return this
  }

  async loadRoutes(dir: string) {
    const scanned = scanRoutes(dir)
    this.routes = []
    for (const s of scanned) {
      const abs = path.resolve(s.filePath)
      // dynamic import the route module
      const mod = await import(pathToFileURL(abs).href) as RouteModule
      // convert routePath with [param] segments into a RegExp and paramNames
      const parts = s.routePath.split('/').filter(Boolean)
      const paramNames: string[] = []
      const regexParts = parts.map((seg) => {
        const m = seg.match(/^\[(.+)\]$/)
        if (m) {
          paramNames.push(m[1]!)
          return '([^/]+)'
        }
        // escape segment for regex
        return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      })
      const pattern = parts.length > 0 ? new RegExp('^/' + regexParts.join('/') + '$') : new RegExp('^/$')

      this.routes.push({ path: s.routePath, modulePath: abs, handlers: mod, pattern, paramNames })
    }
  }

  findHandler(urlPath: string, method: string): { route?: LoadedRoute; handler?: Function; params?: Record<string,string> } {
  const normalized = urlPath.replace(/\\/g, '/')
    for (const r of this.routes) {
      // exact match
      if (r.path === normalized || (r.path === '/' && (normalized === '/' || normalized === '')) ) {
        const handler = (r.handlers as any)[method.toUpperCase()]
        if (handler) return { route: r, handler, params: {} }
      }
      // dynamic pattern match
      if (r.pattern) {
        const m = r.pattern.exec(normalized)
        if (m) {
          const handler = (r.handlers as any)[method.toUpperCase()]
          if (!handler) continue
          const params: Record<string,string> = {}
          const names = r.paramNames ?? []
          for (let i = 0; i < names.length; i++) {
            const name = names[i]!
            params[name] = m[i + 1] ?? ''
          }
          return { route: r, handler, params }
        }
      }
    }
    return {}
  }

  async handle(raw: { method: string; url: string; headers: any; body: string | undefined }, respond: (res: HypeResponseLike) => void) {
    const url = raw.url || '/'
    const method = raw.method || 'GET'
    const pathname = new URL(url, 'http://localhost').pathname
    const found = this.findHandler(pathname, method)
    
    const req = new HypeRequest({ method, url, headers: raw.headers, body: raw.body, params: found.params ?? {} })
    let responseObj: HypeResponseLike = {
      type: 'text',
      body: 'Not Found',
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    }

    try {
      // Execute global middleware
      await this.globalMiddleware.execute(req, responseObj)

      // Execute route-specific middleware if exists
      const routeMiddleware = this.routeMiddleware.get(found.route?.path ?? '')
      if (routeMiddleware) {
        await routeMiddleware.execute(req, responseObj)
      }

      if (found.handler) {
        const handlerValue = found.handler as RouteHandler

        // Get handler parameters
        const params = handlerValue.length - 1 // Last parameter is always the request
        const middlewares: MiddlewareFunction[] = []
        
        // If there are parameters before the request, they are middleware
        if (params > 0) {
          // Extract middleware functions
          for (let i = 0; i < params; i++) {
            const middleware = arguments[i] as MiddlewareFunction
            middlewares.push(middleware)
          }
        }

        // Execute middleware chain
        let currentIndex = 0
        const executeNext = async (): Promise<void> => {
          if (currentIndex < middlewares.length) {
            const middleware = middlewares[currentIndex]!
            currentIndex++
            await middleware(req, responseObj, executeNext)
          }
        }
        
        if (middlewares.length > 0) {
          await executeNext()
        }

        // Execute final handler with request as last parameter
        const result = await handlerValue(...middlewares, req)
        if (result && typeof result === 'object' && 'body' in result) {
          responseObj = result as HypeResponseLike
        } else {
          responseObj = {
            type: 'json',
            body: JSON.stringify(result),
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }
        }
      }
    } catch (err) {
      responseObj = {
        type: 'json',
        body: JSON.stringify({ error: 'Internal server error' }),
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    }

    respond(responseObj)
  }
}

export default Router
