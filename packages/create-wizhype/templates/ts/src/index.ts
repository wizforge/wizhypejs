import { startServer, HypeConfig } from 'wizhypejs'

// Environment variables with TypeScript support
const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true'
}

const config: HypeConfig = {
  port: env.PORT,
  
  // Simple CORS configuration
  cors: {
    // Use environment variable for origin or default based on environment
    origin: env.CORS_ORIGIN,
    
    // Basic headers most APIs need
    allowedHeaders: ['Content-Type', 'Authorization'],
    
    // Enable credentials if specified in environment
    credentials: env.CORS_CREDENTIALS
  }
}

// Start the wizhypejs server
// Routes are automatically loaded from src/routes/<path>/route.ts
startServer(config).catch((err: Error) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
