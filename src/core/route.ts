import type HypeRequest from './request.js'
import type { HypeResponseLike } from './response.js'

export type NextFunction = () => Promise<void>
export type MiddlewareFunction = (req: HypeRequest, res: HypeResponseLike, next: NextFunction) => Promise<void>

// Updated to support middleware parameters
export type RouteHandler = (...args: any[]) => Promise<any> | any

// Support both middleware as parameters and array syntax
export type RouteDefinition = RouteHandler

export type RouteModule = Record<string, RouteDefinition>

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
