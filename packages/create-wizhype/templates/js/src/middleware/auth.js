import { HypeResponse } from 'wizhypejs'

// Auth middleware: Requires an Authorization header
export async function authMiddleware(req, res, next) {
  const token = req.headers.authorization
  if (!token) {
    // Use HypeResponse.json for a clear, consistent response
    return HypeResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await next()
}
