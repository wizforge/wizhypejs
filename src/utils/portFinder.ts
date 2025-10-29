import net from 'net'

/**
 * Check if a port is available
 */
function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer()
    
    server.listen(port, () => {
      server.close(() => {
        resolve(true)
      })
    })
    
    server.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * Find an available port starting from the given port
 * Similar to how React and Next.js work - tries ports incrementally
 */
export async function findAvailablePort(startPort: number = 3000, maxPort: number = 3100): Promise<number> {
  // Ensure startPort is valid
  if (startPort < 1024) startPort = 3000
  if (startPort > 65535) startPort = 3000
  
  // Set reasonable max port if not provided
  if (maxPort <= startPort) maxPort = startPort + 100
  if (maxPort > 65535) maxPort = 65535
  
  for (let port = startPort; port <= maxPort; port++) {
    if (await isPortAvailable(port)) {
      return port
    }
  }
  
  // If no port found in range, throw error
  throw new Error(`No available port found between ${startPort} and ${maxPort}`)
}

export default findAvailablePort