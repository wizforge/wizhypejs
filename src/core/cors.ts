import type { MiddlewareFunction } from './middleware.js'
import type { CorsConfig } from './config.js'
import type HypeRequest from './request.js'
import type { HypeResponseLike } from './response.js'

function isOriginAllowed(origin: string, allowed: string | string[] | boolean | undefined): boolean {
  if (allowed === true || allowed === '*') return true
  if (Array.isArray(allowed)) return allowed.includes(origin)
  if (typeof allowed === 'string') return allowed === origin
  return false
}

export function createCorsMiddleware(options: CorsConfig): MiddlewareFunction {
  const config: Required<CorsConfig> = {
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    ...options
  }

  return async (req: HypeRequest, res: HypeResponseLike, next: () => Promise<void>) => {
    const origin = req.headers.origin || req.headers.Origin
    const method = req.method?.toUpperCase()

    // Initialize headers if undefined
    if (!res.headers) {
      res.headers = {}
    }

    // Handle CORS headers
    if (origin && config.origin !== false) {
      // Check if origin is allowed
      if (isOriginAllowed(origin, config.origin)) {
        res.headers['Access-Control-Allow-Origin'] = config.origin === true ? '*' : origin
      }

      if (config.credentials) {
        res.headers['Access-Control-Allow-Credentials'] = 'true'
      }

      if (config.exposedHeaders.length) {
        res.headers['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ')
      }
    }

    // Handle preflight requests
    if (method === 'OPTIONS') {
      if (config.methods.length) {
        res.headers['Access-Control-Allow-Methods'] = config.methods.join(', ')
      }

      if (config.allowedHeaders.length) {
        res.headers['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ')
      }

      if (typeof config.maxAge === 'number') {
        res.headers['Access-Control-Max-Age'] = config.maxAge.toString()
      }

      if (!config.preflightContinue) {
        res.status = config.optionsSuccessStatus
        return
      }
    }

    await next()
  }
}