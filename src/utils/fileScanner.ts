import fs from 'fs'
import path from 'path'

export type ScannedRoute = {
  routePath: string
  filePath: string
}

/**
 * Scan a directory for route.ts files. A route file is expected to be named `route.ts` (or .js in built output)
 * and located in folders representing path segments. Example: routes/hello/route.ts -> /hello
 */
export function scanRoutes(root: string): ScannedRoute[] {
  const results: ScannedRoute[] = []

  if (!fs.existsSync(root)) return results

  function walk(dir: string, parts: string[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const ent of entries) {
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        walk(p, [...parts, ent.name])
      } else if (ent.isFile()) {
        if (ent.name === 'route.ts' || ent.name === 'route.js') {
          const routePath = '/' + parts.join('/') || '/'
          // normalize root index
          const normalized = routePath.replace(/\\/g, '/')
          results.push({ routePath: normalized === '/' ? '/' : normalized, filePath: p })
        }
      }
    }
  }

  walk(root, [])
  return results
}

export default scanRoutes
