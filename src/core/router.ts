import { scanRoutes } from '../utils/fileScanner.js'
import path from 'path'
import { pathToFileURL } from 'url'
import type { LoadedRoute, RouteModule } from './route.js'
import HypeRequest from './request.js'
import type { HypeResponseLike } from './response.js'

import { MiddlewareChain, MiddlewareFunction } from './middleware.js'
import type { RouteHandler } from './route.js'
import { getMiddleware } from './decorators.js'

/**
 * Helper: detect a response-like value returned by middleware/handlers.
 * We consider an object with a `body` field to be response-like (matches HypeResponse shape).
 */
function isResponseLike(obj: unknown): obj is HypeResponseLike {
  return Boolean(obj && typeof obj === 'object' && 'body' in (obj as any))
}

/**
 * Helper: derive request pathname in a safe way.
 * - If TRUST_PROXY=true, attempt to use X-Forwarded-Proto + Host as base for absolute URL parsing.
 * - If raw.url is already an absolute URL (starts with http/https) we parse it.
 * - Otherwise treat raw.url as a path and split off the query string.
 *
 * This avoids hard-coding 'http://localhost' as a base in production.
 */
function getRequestPath(raw: { url?: string; headers?: Record<string, any> }) {
  const rawUrl = raw.url ?? '/'
  const trustProxy = process.env.TRUST_PROXY === 'true'

  // If caller provided an absolute URL string, use the URL constructor directly.
  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      return new URL(rawUrl).pathname
    } catch {
      return String(rawUrl).split('?')[0] || '/'
    }
  }

  // If behind a trusted proxy, build a base from forwarded headers (only if explicitly enabled)
  if (trustProxy) {
    const proto = (raw.headers && (raw.headers['x-forwarded-proto'] || raw.headers['X-Forwarded-Proto'])) || 'http'
    const host = (raw.headers && raw.headers.host) || 'localhost'
    try {
      return new URL(rawUrl, `${proto}://${host}`).pathname
    } catch {
      return String(rawUrl).split('?')[0] || '/'
    }
  }

  // Default: treat as path-only (most HTTP clients send a path)
  return String(rawUrl).split('?')[0] || '/'
}

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
      const pathKey = pathOrMiddleware
      const middleware = maybeMiddleware
      if (!this.routeMiddleware.has(pathKey)) {
        this.routeMiddleware.set(pathKey, new MiddlewareChain())
      }
      this.routeMiddleware.get(pathKey)?.use(middleware)
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
      const mod = (await import(pathToFileURL(abs).href)) as RouteModule
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

  findHandler(urlPath: string, method: string): { route?: LoadedRoute; handler?: Function; params?: Record<string, string> } {
    const normalized = urlPath.replace(/\\/g, '/')
    for (const r of this.routes) {
      // exact match
      if (r.path === normalized || (r.path === '/' && (normalized === '/' || normalized === ''))) {
        const handler = (r.handlers as any)[method.toUpperCase()]
        if (handler) return { route: r, handler, params: {} }
      }
      // dynamic pattern match
      if (r.pattern) {
        const m = r.pattern.exec(normalized)
        if (m) {
          const handler = (r.handlers as any)[method.toUpperCase()]
          if (!handler) continue
          const params: Record<string, string> = {}
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
    const pathname = getRequestPath(raw)
    const found = this.findHandler(pathname, method)

    const req = new HypeRequest({ method, url, headers: raw.headers, body: raw.body, params: found.params ?? {} })
    let responseObj: HypeResponseLike = {
      type: 'text',
      body: 'Not Found',
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    }

    try {
      // Execute global middleware (MiddlewareChain.execute may return a response-like object)
      const globalResult = await this.globalMiddleware.execute(req, responseObj)
      if (isResponseLike(globalResult)) {
        respond(globalResult!)
        return
      }

      // Execute route-specific middleware if exists
      const routeMiddleware = this.routeMiddleware.get(found.route?.path ?? '')
      if (routeMiddleware) {
        const routeResult = await routeMiddleware.execute(req, responseObj)
        if (isResponseLike(routeResult)) {
          respond(routeResult!)
          return
        }
      }

      if (found.handler) {
        // Check if the handler is an array (old syntax support)
        if (Array.isArray(found.handler)) {
          const middlewares = found.handler.slice(0, -1) as MiddlewareFunction[]
          const finalHandler = found.handler[found.handler.length - 1] as RouteHandler

          // Execute middleware chain and capture any middleware result
          let currentIndex = 0
          const executeNext = async (): Promise<any> => {
            if (currentIndex < middlewares.length) {
              const middleware = middlewares[currentIndex]!
              currentIndex++
              const mwResult = await middleware(req, responseObj, executeNext)
              if (mwResult !== undefined) return mwResult
            }
            return undefined
          }

          let mwResult
          if (middlewares.length > 0) {
            mwResult = await executeNext()
          }

          // If middleware returned a response-like object, use it
          if (isResponseLike(mwResult)) {
            responseObj = mwResult!
          } else {
            // Execute final handler
            const result = await finalHandler(req)
            if (isResponseLike(result)) {
              responseObj = result
            } else {
              responseObj = {
                type: 'json',
                body: JSON.stringify(result),
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            }
          }
        } else {
          // Get the actual handler function
          const handler = found.handler as Function

          // Get the middleware functions from handler's properties
          const middlewares = getMiddleware(handler)

          // Execute middleware chain and capture any middleware result
          let currentIndex = 0
          const executeNext = async (): Promise<any> => {
            if (currentIndex < middlewares.length) {
              const middleware = middlewares[currentIndex]!
              currentIndex++
              const mwResult = await middleware(req, responseObj, executeNext)
              if (mwResult !== undefined) return mwResult
            }
            return undefined
          }

          let mwResult
          if (middlewares.length > 0) {
            mwResult = await executeNext()
          }

          // If middleware returned a response-like object, use it
          if (isResponseLike(mwResult)) {
            responseObj = mwResult!
          } else {
            // Execute the handler (wrap with try/catch at call site if you want finer diagnostics)
            const result = await handler(req)
            if (isResponseLike(result)) {
              responseObj = result
            } else {
              responseObj = {
                type: 'json',
                body: JSON.stringify(result),
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              }
            }
          }
        }
      }
    } catch (err) {
      // Log error for diagnostics, but return a generic 500 body
      try {
        console.error('Router.handle error:', err && (err as any).stack ? (err as any).stack : err)
      } catch {
        // ignore logging errors
      }
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