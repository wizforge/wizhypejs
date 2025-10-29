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

export async function GET(req: any) {
  return HypeResponse.json({ message: 'Hello from GET' })
}

export async function POST(req: any) {
  const body = await req.json()
  return HypeResponse.json({ message: 'Created', payload: body }, { status: 201 })
}
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
export async function GET(req: any) {
  const id = req.params.id
  return {
    type: 'json',
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, message: 'item details' })
  }
}
```

Notes:
- The scanner looks for `route.ts` (or `route.js` in built output) inside folders under `src/routes` and converts bracketed segments like `[id]` into route parameters.
- You can use multiple dynamic segments (e.g. `/users/[userId]/posts/[postId]`) and they'll appear on `req.params` with their names.
- The current matcher treats bracketed segments as `([^/]+)` (non-empty segment without slashes). If you need optional segments, custom patterns, or typed constraints, we can extend the segment syntax later.

## 📦 Features

- 🎯 File-based routing — route files map to URL paths automatically
- 🧾 Simple request helpers — `req.json()`, `req.text()`
- 📤 Response helpers — `HypeResponse.json()` and `HypeResponse.text()` with optional status & headers
- 🚀 Developer CLI — `create`, `dev`, `build`, `start` (scaffolds working examples)
- 🔧 TypeScript-ready templates and types
- 🔌 Small surface area — easy to extend with middleware or advanced routing later

## 🧭 API Reference

Below are the most-used pieces of the runtime. These are intentionally small and sync with the scaffold templates.

### startServer(options?)
Start the local HTTP server and load file-based routes.

```ts
import { startServer } from 'wizhypejs'
startServer({ port: 3000 })
```

options: { port?: number } — defaults to 3000

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

### Request helpers

- `req.json()` — parse JSON body (async)
- `req.text()` — get raw text body
- `req.method`, `req.url`, `req.headers` — request metadata

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