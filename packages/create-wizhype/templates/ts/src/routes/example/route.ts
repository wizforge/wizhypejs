import type { HypeRequest } from 'wizhypejs'
import { createHandler, HypeResponse } from 'wizhypejs'
// Middleware imports (correct relative path to src/middleware)
// @ts-ignore
import { loggerMiddleware } from '../../middleware/logger.js'
// @ts-ignore
import { authMiddleware } from '../../middleware/auth.js'

// Public route, no middleware
export async function GET(req: HypeRequest) {
  return HypeResponse.json({
    message: 'Hello from wizhypejs!',
    timestamp: new Date().toISOString(),
  })
}

// Route protected by middleware (auth only)
export const POST = createHandler(
  async (req: HypeRequest) => {
    try {
      const body = await req.json()
      return HypeResponse.json({
        message: 'Created',
        received: body,
      }, { status: 201 })
    } catch (err) {
      console.error('POST /example handler error:', err)
      return HypeResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  },
  authMiddleware
)

// Route with logging middleware
export const PUT = createHandler(
  async (req: HypeRequest) => {
    return HypeResponse.json({
      message: 'Protected route with logging',
      data: 'Requires authentication and logs access',
      timestamp: new Date().toISOString(),
    })
  },
  loggerMiddleware
)

// You can also add middleware to handlers later with attachMiddleware (advanced)
// export const PATCH = attachMiddleware(handlerFunction, loggerMiddleware, authMiddleware)