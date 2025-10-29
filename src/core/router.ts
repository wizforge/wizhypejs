import { scanRoutes } from '../utils/fileScanner.js'
import path from 'path'
import { pathToFileURL } from 'url'
import type { LoadedRoute, RouteModule } from './route.js'
import HypeRequest from './request.js'
import { HypeResponseLike } from './response.js'

export class Router {
  routes: LoadedRoute[] = []

  constructor() {}

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
    if (!found.handler) {
      respond({ type: 'text', body: 'Not Found', status: 404, headers: { 'Content-Type': 'text/plain' } })
      return
    }
    const req = new HypeRequest({ method, url, headers: raw.headers, body: raw.body, params: found.params ?? {} })
    try {
      const result = await found.handler(req)
      // If handler returns HypeResponseLike
      if (result && typeof result === 'object' && 'body' in result) {
        respond(result as HypeResponseLike)
        return
      }
      // otherwise send JSON
      respond({ type: 'json', body: JSON.stringify(result), status: 200, headers: { 'Content-Type': 'application/json' } })
    } catch (err) {
      respond({ type: 'json', body: JSON.stringify({ error: 'Internal server error' }), status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  }
}

export default Router
