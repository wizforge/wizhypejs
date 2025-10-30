import type { HypeRequest } from 'wizhypejs'

type NextFunction = () => Promise<void>
type MiddlewareFunction = (
  req: HypeRequest,
  res: { status?: number; body?: string; headers?: Record<string, string> },
  next: NextFunction
) => Promise<void>

// Example middleware with TypeScript types
const loggerMiddleware: MiddlewareFunction = async (req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`)
  await next()
}

const authMiddleware: MiddlewareFunction = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    res.status = 401
    res.body = JSON.stringify({ error: 'Unauthorized' })
    return
  }
  await next()
}

// Public route - no middleware
export async function GET(req: HypeRequest) {
  return {
    message: 'Hello World!'
  }
}

// Route with single middleware
export async function POST(authMiddleware: MiddlewareFunction, req: HypeRequest) {
  return {
    message: 'Protected route',
    data: 'This route requires authentication'
  }
}

// Route with multiple middleware
export async function PUT(
  loggerMiddleware: MiddlewareFunction, 
  authMiddleware: MiddlewareFunction, 
  req: HypeRequest
) {
  return {
    message: 'Protected route with logging',
    data: 'This route requires authentication and logs access'
  }
}