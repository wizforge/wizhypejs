<!-- prettier-ignore -->
# create-wizhype

<div align="center">

![NPM Version](https://img.shields.io/npm/v/create-wizhype.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-brightgreen.svg)

</div>

A tiny CLI to scaffold a new wizhypejs project with sensible defaults — TypeScript and JavaScript templates included. Get started quickly with an opinionated file-based backend routing structure and working dev scripts.

## Quick demo

```bash
npx create-wizhype my-app
cd my-app
npm install
npm run dev
```

The generated project includes a minimal server entry and example routes so you can curl the API immediately:

```bash
curl http://localhost:3000/hello
```

## Features

- Scaffolds TypeScript or JavaScript projects
- Adds `src/routes/` with example API routes
- Includes working dev/build/start scripts
- Small, focused template ideal for microservices and prototypes

## CLI usage

Create a new project (TypeScript is the default):

```bash
npx create-wizhype my-app
```

Create with JavaScript instead of TypeScript:

```bash
npx create-wizhype my-app --language js
# or short form
npx create-wizhype my-app -l js
```

## Generated project structure

The scaffolded app contains everything you need to start:

```
my-app/
├─ package.json      # scripts: dev, build, start
├─ src/
│  ├─ index.ts       # server entry
│  └─ routes/
│     ├─ hello/route.ts
│     └─ health/route.ts
├─ tsconfig.json     # when TS selected
└─ README.md
```

## Example route

```ts
// src/routes/hello/route.ts
export async function GET(req: any) {
	return {
		type: 'json',
		status: 200,
		body: JSON.stringify({ message: 'Hello from your new wizhype app' })
	}
}
```

## Tips

- Run `npm run dev` to start with hot reload during development.
- Use `npm run build` and `npm start` for production.

## Learn more

- Project: https://github.com/wizforge/wizhypejs
- Routing docs: see `src/routes` in the scaffolded app

## Contributing

If you'd like to improve the templates, open a PR in this repository. Tests and small quality-of-life templates (auth, DB, uploads) are welcome.

## License

MIT
