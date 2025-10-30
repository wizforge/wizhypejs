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

```bash
# TypeScript (default)
npx create-wizhype my-app

# JavaScript
npx create-wizhype my-app --language js

cd my-app
npm install
npm run dev
```

### Environment Configuration

Create a `.env` file in your project root:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=false
```

### Simple Server Setup

```typescript
import { startServer } from 'wizhypejs'

// Simple configuration with environment variables
startServer({
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    allowedHeaders: ['Content-Type', 'Authorization']
  }
})
```

The scaffold sets up a minimal project with `src/index.(ts|js)`, `src/routes/` with example routes (`/hello`, `/health`), and all dependencies pre-configured.

### 30-Second Setup (manual — in existing projects)

If you already have a wizhypejs project scaffolded, create a route manually:

Create `src/routes/hello/route.ts`:

```ts
import { startServer } from 'wizhypejs'

startServer({ port: 3000 })
```

Then run:

```bash
npm run dev   # or: npm run build && npm start
```

Visit: http://localhost:3000/hello

## 📁 Routing Convention

Routes live under `src/routes/<path>/route.ts` (or `.js`). Each `route.*` exports named functions matching HTTP methods (uppercase): `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`, `HEAD`.

Example: `src/routes/hello/route.ts`

```ts
import { HypeResponse } from 'wizhypejs'

// Simple route handler (no middleware)
export async function GET(req) {
  return HypeResponse.json({ message: 'Hello from GET' })
}

// Middleware definition
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization
  if (!token) {
    res.status = 401
    res.body = JSON.stringify({ error: 'Unauthorized' })
    return
  }
  await next()
}

// Route with middleware (Express-style)
export async function POST(authMiddleware, req) {
  const body = await req.json()
  return HypeResponse.json({ message: 'Created', payload: body }, { status: 201 })
}

// Route with multiple middleware
export async function PUT(loggerMiddleware, authMiddleware, req) {
  const body = await req.json()
  return HypeResponse.json({ message: 'Updated', payload: body })
}

// Alternative array syntax is also supported
export const DELETE = [authMiddleware, async (req) => {
  return HypeResponse.json({ message: 'Deleted' })
}]
```

JavaScript example uses the same shape:

```js
import { HypeResponse } from 'wizhypejs'

export async function GET(req) {
  return HypeResponse.json({ message: 'Hello from JS GET' })
}
```

### Dynamic routes

You can create dynamic route segments by wrapping the segment name in square brackets in the folder name. For example:

```
src/routes/items/[id]/route.ts
```

This will match requests such as `GET /items/123` or `GET /items/abc` and the framework will extract the value of the dynamic segment and provide it to your handler on `req.params` (e.g. `req.params.id === '123'`).

Minimal example route:

```ts
// src/routes/items/[id]/route.ts
import { HypeResponse } from "wizhypejs";
export async function GET(req: any) {
    const id  = req.params.id;
    const item = { id, name: `Item ${id}`, description: `This is item number ${id}` };

    return HypeResponse.json({ status: "success", data: item, statusCode: 200 });
}
```

Notes:
- The scanner looks for `route.ts` (or `route.js` in built output) inside folders under `src/routes` and converts bracketed segments like `[id]` into route parameters.
- You can use multiple dynamic segments (e.g. `/users/[userId]/posts/[postId]`) and they'll appear on `req.params` with their names.
- The current matcher treats bracketed segments as `([^/]+)` (non-empty segment without slashes). If you need optional segments, custom patterns, or typed constraints, we can extend the segment syntax later.

## 📦 Features

- 🎯 File-based routing — route files map to URL paths automatically
- 🔒 Built-in CORS support — easy configuration for cross-origin requests
- 🔌 Express-style middleware — global and route-specific middleware support
- 🚀 Auto port configuration — automatic fallback to available ports
- 🧾 Simple request helpers — `req.json()`, `req.text()`
- 📤 Response helpers — `HypeResponse.json()` and `HypeResponse.text()` with optional status & headers
- � Hot reload in development — fast development workflow
- � TypeScript-ready templates and types
- ⚡ Small and fast — minimal overhead, maximum performance

## 🧭 API Reference

Below are the most-used pieces of the runtime. These are intentionally small and sync with the scaffold templates.

### startServer(options?)
Start the local HTTP server and load file-based routes.

```ts
import { startServer } from 'wizhypejs'

startServer({
  port: 3000,
  // Enable CORS with custom configuration
  cors: {
    origin: ['http://localhost:3000', 'https://yourapp.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400
  }
})
```

Options:
- `port?: number` — Server port (defaults to 3000)
- `routesDir?: string` — Custom routes directory
- `cors?: boolean | CorsConfig` — CORS configuration
  - `origin?: string | string[] | boolean` — Allowed origins
  - `methods?: string[]` — Allowed HTTP methods
  - `allowedHeaders?: string[]` — Allowed request headers
  - `exposedHeaders?: string[]` — Headers exposed to browser
  - `credentials?: boolean` — Allow credentials
  - `maxAge?: number` — Preflight cache duration
  - `preflightContinue?: boolean` — Pass OPTIONS to routes
  - `optionsSuccessStatus?: number` — OPTIONS response code

### HypeResponse
Helpers to create responses from your handler functions.

- `HypeResponse.json(data, { status?: number, headers?: Record<string,string> })` — JSON response
- `HypeResponse.text(text, { status?: number, headers?: Record<string,string> })` — plain text response

Example:

```ts
import { HypeResponse } from 'wizhypejs'

export async function GET(req: any) {
  const data = { hello: 'world' }
  return HypeResponse.json(data)
}
```

### Middleware Support

Hype.js supports three ways to use middleware:

1. Express-style Parameter Syntax (Recommended):
```typescript
// src/routes/admin/route.ts

// Define middleware
const authMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    res.status = 401
    res.body = JSON.stringify({ error: 'Unauthorized' })
    return
  }
  await next()
}

// Use middleware as parameters (Express-style)
export async function GET(authMiddleware, req) {
  return { message: 'Protected route' }
}

// Multiple middleware
export async function POST(loggerMiddleware, authMiddleware, req) {
  return { message: 'Protected with logging' }
}
```

2. Array Syntax (Alternative):
```typescript
// Use middleware in array
export const PUT = [authMiddleware, async (req) => {
  return { message: 'Protected route' }
}]
```

3. Global Middleware:
```typescript
// Apply middleware to all routes
const server = await startServer()
server.router.use(async (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  await next()
})
```

TypeScript Support:
```typescript
import type { HypeRequest } from 'wizhypejs'

type MiddlewareFunction = (
  req: HypeRequest,
  res: { status?: number; body?: string; headers?: Record<string, string> },
  next: () => Promise<void>
) => Promise<void>

// Type-safe middleware
const authMiddleware: MiddlewareFunction = async (req, res, next) => {
  // Your middleware logic
  await next()
}

// Type-safe route with middleware
export async function GET(authMiddleware: MiddlewareFunction, req: HypeRequest) {
  return { message: 'Type-safe route' }
}
```

### Request helpers

- `req.json()` — parse JSON body (async)
- `req.text()` — get raw text body
- `req.method`, `req.url`, `req.headers` — request metadata
- `req.params` — route parameters from dynamic segments

## 🔧 CLI (scaffold & run)

The CLI is included as the package `bin` entry. Use via `npx wizhypejs ...` or install globally.

- `npx wizhypejs create <name> [lang]` — scaffold a project. `lang` is `ts` (default) or `js`.
- `npx wizhypejs dev` — run the example project's `dev` script
- `npx wizhypejs build` — compile TypeScript templates to `dist`
- `npx wizhypejs start` — run the built project

The TypeScript template uses `ts-node-dev` for hot reload; JS template uses `nodemon`.

## 🛠️ Developing the framework locally

- Use `npm run build` to compile the project.
- Optionally use `npm link` to test the package in a local scaffolded app:

```bash
# in framework repo
npm link

# in example project
npm link wizhypejs
npm run dev
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a branch: `git checkout -b feature/awesome`
3. Run `npm run build` and add tests for new behavior
4. Open a PR with a description and reproducible steps

See the `LICENSE` file for license info (MIT).

## 📋 Changelog

### v1.0.9
- 🎯 Added Express-style middleware parameter syntax
- 🔄 Simplified CORS configuration
- ⚙️ Added environment variables support
- 🛠️ Improved TypeScript type definitions
- 📝 Updated templates with new middleware syntax
- 🌟 Enhanced documentation and examples

### v1.0.8
- ✨ Added built-in CORS support with extensive configuration options
- 🔌 Added middleware support (global and route-specific)
- 🚀 Added automatic port finding when preferred port is busy
- 🔄 Improved TypeScript support and type definitions
- 📝 Updated templates with CORS and middleware examples
- 🐛 Various bug fixes and performance improvements

### v1.0.0
- Initial minimal release — file-based routing, CLI scaffolding, request/response helpers

---

<div align="center">

### 🚀 Ready to scaffold a new project?

```bash
npx wizhypejs create my-app
```

Visit the `src/cli/templates` folder for the template code and example routes.

</div>