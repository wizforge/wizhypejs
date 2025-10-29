# My wizhypejs App

A backend API built with [wizhypejs](https://github.com/wizforge/hype.js).

## Quick Start

```bash
npm install
cp .env.example .env  # Set up environment variables
npm run dev
```

Visit http://localhost:3000/hello to test.

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available variables:
- `PORT` — server port (default: 3000, auto-detects if busy)

## Project Structure

```
src/
  index.js          — server entry
  routes/           — file-based routes
    hello/
      route.js      — GET, POST handlers
    health/
      route.js      — health check
```

## Routes

Routes are JavaScript files in `src/routes/<path>/route.js`. Export functions named after HTTP methods:

```js
import { HypeResponse } from 'wizhypejs'

export async function GET(req) {
  return HypeResponse.json({ hello: 'world' })
}
```

## Scripts

- `npm run dev` — start dev server with hot reload
- `npm start` — run app

## Learn More

Read the [wizhypejs documentation](https://github.com/wizforge/hype.js#readme).