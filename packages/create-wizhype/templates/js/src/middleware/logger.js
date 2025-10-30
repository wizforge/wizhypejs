// Logger middleware logs each request method and url
export async function loggerMiddleware(req, res, next) {
  console.log(`📝 ${req.method} ${req.url}`)
  // logger doesn't return a response itself, just continues
  await next()
}
