# create-wizhype

Scaffolding tool for [wizhypejs](https://github.com/wizforge/hype.js) projects. Similar to `create-next-app` but for backend file-based routing.

## Usage

```bash
npx create-wizhype my-app
cd my-app
npm install
npm run dev
```

## Options

```bash
# Scaffold with JavaScript (default: TypeScript)
npx create-wizhype my-app --language js

# Or short form
npx create-wizhype my-app -l js
```

## What's Included

Both TypeScript and JavaScript templates come with:

- **package.json** — dependencies and scripts pre-configured
- **src/index.(ts|js)** — server entry that starts wizhypejs
- **src/routes/** — example routes (hello, health)
- **tsconfig.json** (TypeScript only) — TypeScript configuration
- **.gitignore** — sensible defaults
- **README.md** — project documentation

## Getting Started

After scaffolding:

```bash
npm install                # Install dependencies
npm run dev                # Start dev server with hot reload
curl http://localhost:3000/hello   # Test the API
```

## Learn More

- [wizhypejs Documentation](https://github.com/wizforge/hype.js#readme)
- [File-based Routing Guide](https://github.com/wizforge/hype.js#-routing-convention)

## License

MIT
