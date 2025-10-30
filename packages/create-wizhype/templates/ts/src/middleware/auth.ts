import type { HypeRequest } from 'wizhypejs'
import { HypeResponse } from 'wizhypejs'

// Auth middleware: Requires an Authorization header
export async function authMiddleware(
  req: HypeRequest,
  res: { status?: number; body?: string; headers?: Record<string, string> },
  next: () => Promise<void>
) {
  const token = req.headers.authorization
  // Debug logging to confirm middleware execution
  try {
    console.log(`🔒 authMiddleware: authorization=${String(token)}`)
  } catch (e) {
    console.log('🔒 authMiddleware: could not read headers')
  }

  if (!token) {
    console.log('🔒 authMiddleware: missing token, returning 401')
    // Return a HypeResponse JSON with 401 to short-circuit the handler
    return HypeResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  console.log('🔒 authMiddleware: token present, calling next()')
  console.log('Auth middleware passed')
  await next()
}
