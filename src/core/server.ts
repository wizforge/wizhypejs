import http from 'http'
import path from 'path'
import Router from './router.js'
import logger from '../utils/logger.js'

export async function startServer(opts: { port?: number; routesDir?: string } = {}) {
  const port = opts.port ?? (process.env.PORT ? Number(process.env.PORT) : 3000)
  const routesDir = opts.routesDir ?? path.resolve(process.cwd(), 'src/routes')
  const router = new Router()
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
  console.log(`Hype server listening on http://localhost:${port}`)
  return server
}

export default startServer
