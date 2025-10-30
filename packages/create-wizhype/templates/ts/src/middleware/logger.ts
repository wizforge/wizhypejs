import type { HypeRequest } from 'wizhypejs'

// Logger middleware logs each request method and url
export async function loggerMiddleware(
  req: HypeRequest,
  res: { status?: number; body?: string; headers?: Record<string, string> },
  next: () => Promise<void>
) {
  console.log(`📝 ${req.method} ${req.url}`)
  await next()
}
