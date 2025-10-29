import { startServer } from 'wizhypejs'

// Start the wizhypejs server
// Routes are automatically loaded from src/routes/<path>/route.ts
startServer({ port: Number(process.env.PORT || 3000) }).catch((err: any) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
