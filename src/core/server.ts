import http from 'http'
import path from 'path'
import Router from './router.js'
import logger from '../utils/logger.js'
import { findAvailablePort } from '../utils/portFinder.js'
import { HypeConfig, CorsConfig, defaultConfig } from './config.js'
import { createCorsMiddleware } from './cors.js'

export async function startServer(opts: HypeConfig = {}) {
  // Merge with default config
  const config = { ...defaultConfig, ...opts }
  // Parse initial port preference
  let preferredPort = opts.port
  if (preferredPort === undefined) {
    const envPort = process.env.PORT
    if (envPort) {
      const parsedPort = parseInt(envPort, 10)
      preferredPort = isNaN(parsedPort) ? 3000 : parsedPort
    } else {
      preferredPort = 3000
    }
  }
  
  // Validate port range
  if (isNaN(preferredPort) || preferredPort < 0 || preferredPort > 65535) {
    preferredPort = 3000
  }

  // Find an available port starting from the preferred port
  const port = await findAvailablePort(preferredPort)

  const routesDir = config.routesDir ?? path.resolve(process.cwd(), 'src/routes')
  const router = new Router()

  // Apply CORS if enabled
  if (config.cors) {
    const corsConfig = config.cors === true ? (defaultConfig.cors as CorsConfig) : config.cors
    router.use(createCorsMiddleware(corsConfig))
  }

  await router.loadRoutes(routesDir)

  const server = http.createServer(async (req, res) => {
    try {
      const start = process.hrtime()
      const chunks: Buffer[] = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', async () => {
        const body = Buffer.concat(chunks).toString('utf8') || undefined
        await router.handle({ method: req.method ?? 'GET', url: req.url ?? '/', headers: req.headers as any, body }, (hres: any) => {
          res.statusCode = hres.status ?? 200
          const headers = hres.headers ?? {}
          for (const [k, v] of Object.entries(headers)) {
            if (v !== undefined) res.setHeader(k, v as any)
          }
          res.end(hres.body)
          try {
            const diff = process.hrtime(start)
            const durationMs = diff[0] * 1000 + diff[1] / 1e6
            logger.logRequest({ method: req.method, url: req.url }, res.statusCode, durationMs)
          } catch (e) {
            // ignore logging errors
          }
        })
      })
    } catch (err) {
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  await new Promise<void>((resolve) => server.listen(port, () => resolve()))
  
  // Show helpful message if port was changed
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} was busy, using port ${port} instead`)
  }
  console.log(`🚀 Hype server listening on http://localhost:${port}`)
  return server
}

export default startServer
