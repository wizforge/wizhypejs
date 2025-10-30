// Load environment variables from .env file
import 'dotenv/config'

// Re-export public API for route authors
export { HypeResponse } from './core/response.js'
export type { HypeResponseLike } from './core/response.js'

export { HypeRequest } from './core/request.js'
export type { RawRequestShape } from './core/request.js'

export { default as Router } from './core/router.js'
export { startServer } from './core/server.js'
export type { HypeConfig, CorsConfig } from './core/config.js'
export type { MiddlewareFunction } from './core/middleware.js'

// Export middleware helpers
export { createHandler, attachMiddleware } from './core/decorators.js'

// Also export utilities
export { default as scanRoutes } from './utils/fileScanner.js'
export { findAvailablePort } from './utils/portFinder.js'
