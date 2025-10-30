// Example of a route with custom CORS configuration
export const GET = async (req) => {
  return {
    message: 'This is a public API endpoint',
    timestamp: new Date().toISOString()
  }
}

// Example of a protected route
export const POST = async (req) => {
  // Check for authorization header
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return {
      error: 'Authorization required',
      status: 401
    }
  }

  return {
    message: 'Data successfully processed',
    success: true
  }
}

// Example of handling preflight requests explicitly
export const OPTIONS = async (req) => {
  // The global CORS middleware will handle this automatically
  return {
    status: 204
  }
}