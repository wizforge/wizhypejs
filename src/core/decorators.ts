import type { MiddlewareFunction } from './middleware.js'

// Symbol to store middleware on the handler
const middlewareSymbol = Symbol('middlewares')

// Function to get middleware from a handler
export function getMiddleware(handler: Function): MiddlewareFunction[] {
  return (handler as any)[middlewareSymbol] || []
}

// Function to attach middleware to a handler
export function attachMiddleware(handler: Function, ...middleware: MiddlewareFunction[]): Function {
  const existingMiddleware = getMiddleware(handler)
  ;(handler as any)[middlewareSymbol] = [...existingMiddleware, ...middleware]
  return handler
}

// Function to create a route handler with middleware
export function createHandler(handler: Function, ...middleware: MiddlewareFunction[]): Function {
  return attachMiddleware(handler, ...middleware)
}