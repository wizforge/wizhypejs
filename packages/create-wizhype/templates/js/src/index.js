import { startServer } from 'wizhypejs'

// Server configuration with environment variables support
const config = {
  // Use PORT from environment variables or default to 3000
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,

  // Simple CORS configuration
  cors: {
    // Use CORS_ORIGIN from env or allow all in development
    origin: process.env.CORS_ORIGIN || '*',
    // Basic headers most APIs need
    allowedHeaders: ['Content-Type', 'Authorization']
  }
}

// Start the wizhypejs server
// Routes are automatically loaded from src/routes/<path>/route.js
startServer(config).catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
