# My wizhypejs App

A backend API built with [wizhypejs](https://github.com/wizforge/hype.js).

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000/hello to test.

## Project Structure

```
src/
  index.ts          — server entry
  routes/           — file-based routes
    hello/
      route.ts      — GET, POST handlers
    health/
      route.ts      — health check
```

## Routes

Routes are TypeScript files in `src/routes/<path>/route.ts`. Export functions named after HTTP methods:

```ts
import { HypeResponse } from 'wizhypejs'

export async function GET(req: any) {
  return HypeResponse.json({ hello: 'world' })
}
```

## Scripts

- `npm run dev` — start dev server with hot reload
- `npm run build` — compile TypeScript
- `npm start` — run compiled app

## Learn More

Read the [wizhypejs documentation](https://github.com/wizforge/hype.js#readme).
