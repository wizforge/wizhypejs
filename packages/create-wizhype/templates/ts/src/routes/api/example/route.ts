import type { HypeRequest } from 'wizhypejs'

// Example of a route with custom CORS configuration
export const GET = async (req: HypeRequest) => {
  return {
    message: 'This is a public API endpoint',
    timestamp: new Date().toISOString()
  }
}

// Example of a protected route with type-safe request handling
export const POST = async (req: HypeRequest) => {
  // Check for authorization header
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return {
      error: 'Authorization required',
      status: 401
    }
  }

  // Parse and validate request body
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  
  return {
    message: 'Data successfully processed',
    received: body,
    success: true
  }
}

// Example of handling preflight requests explicitly
export const OPTIONS = async (req: HypeRequest) => {
  // The global CORS middleware will handle this automatically
  return {
    status: 204
  }
}