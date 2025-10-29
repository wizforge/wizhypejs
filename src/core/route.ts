import type HypeRequest from './request.js'

export type RouteHandler = (req: HypeRequest) => Promise<any> | any

export type RouteModule = Record<string, RouteHandler>

export type LoadedRoute = {
  path: string
  modulePath: string
  handlers: RouteModule
  /** optional RegExp used to match dynamic routes (eg. /items/([^/]+)) */
  pattern?: RegExp
  /** names of params in the pattern in order (eg. ['id']) */
  paramNames?: string[]
}

export default RouteModule
