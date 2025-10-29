import { startServer } from 'wizhypejs'

// Start the wizhypejs server
// Routes are automatically loaded from src/routes/<path>/route.js
startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
