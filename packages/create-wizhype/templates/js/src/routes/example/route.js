// Example middleware
const loggerMiddleware = async (req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`)
  await next()
}

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    res.status = 401
    res.body = JSON.stringify({ error: 'Unauthorized' })
    return
  }
  await next()
}

// Public route - no middleware
export async function GET(req) {
  return {
    message: 'Hello World!'
  }
}

// Route with single middleware
export async function POST(authMiddleware, req) {
  return {
    message: 'Protected route',
    data: 'This route requires authentication'
  }
}

// Route with multiple middleware
export async function PUT(loggerMiddleware, authMiddleware, req) {
  return {
    message: 'Protected route with logging',
    data: 'This route requires authentication and logs access'
  }
}