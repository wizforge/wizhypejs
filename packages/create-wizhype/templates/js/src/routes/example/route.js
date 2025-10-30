import { createHandler, HypeResponse } from 'wizhypejs'
import { loggerMiddleware } from '../middleware/logger.js'
import { authMiddleware } from '../middleware/auth.js'

// Public route, no middleware
export async function GET(req) {
  return HypeResponse.json({
    message: 'Hello from wizhypejs!',
    timestamp: new Date().toISOString(),
  })
}

// Route protected by middleware (auth only)
export const POST = createHandler(
  async (req) => {
    const body = await req.json()
    return HypeResponse.json({
      message: 'Created',
      received: body,
    }, { status: 201 })
  },
  authMiddleware
)

// Route with multiple middleware (logging and auth)
export const PUT = createHandler(
  async (req) => {
    return HypeResponse.json({
      message: 'Protected route with logging',
      data: 'Requires authentication and logs access',
      timestamp: new Date().toISOString(),
    })
  },
  loggerMiddleware,
  authMiddleware
)