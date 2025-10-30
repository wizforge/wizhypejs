<div align="center">

# wizhypejs

### File-based backend routing for Node — focused on server-only APIs

*A tiny, developer-first routing framework for Node.js. Create file-based API routes and run a fast, minimal server with an easy CLI.*

[![NPM Version](https://img.shields.io/npm/v/wizhypejs.svg)](https://www.npmjs.com/package/wizhypejs)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

[Repository](https://github.com/wizforge/wizhypejs)

### 🚀 Quick • Simple • File-based

[📦 Features](#-features) • [⚙️ Quick Start](#-quick-start) • [📁 Routing Convention](#-routing-convention) • [🧭 API Reference](#-api-reference)

</div>

---

## 🤔 Why wizhypejs?

Building server APIs is straightforward — but wiring a small, consistent project structure each time can be repetitive. `wizhypejs` provides a minimal, Next.js-like file-based routing experience for backend-only services:

- ⚡ Zero ceremony — one file per route folder, export HTTP method handlers
- 🧪 TypeScript-ready — templates and types included
- 🔁 Fast dev loop — dev templates use `ts-node-dev` / `nodemon`
- 🧩 Small runtime — request helpers and response helpers you actually use

Perfect for microservices, prototyping, or APIs where you want simple routing without a heavy framework.

## ⚙️ Quick Start

Scaffold a new project using `create-wizhype` (TypeScript is the default):


A tiny, developer-first file-based routing framework for Node.js focused on server-only APIs.

- Node: >= 18
- TypeScript-ready

Features at a glance
- File-based routes mapped from `src/routes/*/route.(ts|js)`
- Express-style and array middleware support
- Built-in, configurable CORS middleware
- Small runtime with request helpers and `HypeResponse` helpers
- Dev hot-reload in templates, production runs from `dist/` when present

Quick start
1. Scaffold a new project (TypeScript by default):

```bash
npx create-wizhype my-app
cd my-app
npm install
npm run dev
```

2. Production (built) start:

```bash
npm run build
npm start
```

Notes about generated projects
- TypeScript template: `start` runs `npm run build && node dist/index.js`.
- JavaScript template: includes a cross-platform `scripts/build.js` that copies `src/` → `dist/`; `start` runs the built `dist/index.js`.
- The runtime prefers `dist/routes` when present. That means if you build your app, the server will load compiled route files from `dist/routes` in production.

Routing convention
- Place route files under `src/routes/<path>/route.ts` (or `.js`).
- Export uppercase method handlers: `export async function GET(req) { ... }`.
- Dynamic segments use bracketed folder names: `src/routes/items/[id]/route.ts` → `req.params.id`.

Minimal example (TypeScript)
```ts
import { HypeResponse } from 'wizhypejs'

export async function GET(req) {
  return HypeResponse.json({ message: 'Hello' })
}
```

Middleware
- Recommended: Express-style parameter middleware. Middleware can return a response early using `HypeResponse.json()`.

Example:
```ts
// src/routes/api/example/route.ts
import { HypeResponse, createHandler } from 'wizhypejs'

const auth = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) return HypeResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await next()
}

export async function GET(req) {
  return HypeResponse.json({ ok: true })
}

export const POST = createHandler(
  async (req) => {
    const body = await req.json()
    return HypeResponse.json({ created: true, body }, { status: 201 })
  },
  auth
)
```

Global middleware
```ts
const server = await startServer()
server.router.use(async (req,res,next) => { console.log(req.method, req.url); await next() })
```

API highlights
- startServer(options) — start server and load routes. Options include `port`, `routesDir`, and `cors`.
- HypeResponse.json(data, {status, headers}) — create JSON responses from handlers.

CORS
- `startServer({ cors: true })` applies default CORS policy. Pass a `CorsConfig` object to customize origins, methods, headers, credentials, and preflight behavior.

CLI
- The package provides a CLI (exposed as `hype` / `wizhypejs`) to scaffold templates and run scripts:
  - `npx wizhypejs create <name> [ts|js]` — scaffold a new project
  - `npx wizhypejs dev` — run dev script from the generated app
  - `npx wizhypejs build` — run build script in the generated app
  - `npx wizhypejs start` — run start script in the generated app

Dev vs Production notes
- Dev: use the template's `dev` script (nodemon / ts-node dev setups exist in template projects).
- Prod: build the app (`npm run build`) so compiled files land in `dist/`. The server prefers `dist/routes` when present — this avoids accidentally loading source files in production.

Templates
- TypeScript template uses `ts-node`/`ts-node-dev` in `dev` and builds to `dist` for start.
- JavaScript template includes `scripts/build.js` (cross-platform) that copies `src/` → `dist/` and `start` runs `dist/index.js`.

Contributing
- Fork, branch, run `npm run build`, add tests for new behavior, open a PR.

Changelog (high level)
- v1.2.3 — Preferred `dist/routes` in production; improved middleware examples in templates; cross-platform JS template build script.
- v1.0.x — Initial middleware & CORS support, file-based routing, CLI scaffolding.

License
- MIT

Enjoy building! If you'd like changes to the docs or want examples added (database, auth, uploads), open an issue or PR.