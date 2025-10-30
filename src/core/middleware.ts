import type HypeRequest from './request.js'
import type { HypeResponseLike } from './response.js'

export type NextFunction = () => Promise<void>
export type MiddlewareFunction = (req: HypeRequest, res: HypeResponseLike, next: NextFunction) => Promise<void>

export class MiddlewareChain {
  private middlewares: MiddlewareFunction[] = []

  use(middleware: MiddlewareFunction) {
    this.middlewares.push(middleware)
    return this
  }

  async execute(req: HypeRequest, res: HypeResponseLike) {
    let currentIndex = 0
    
    const executeNext = async (): Promise<void> => {
      if (currentIndex < this.middlewares.length) {
        const middleware = this.middlewares[currentIndex]!  // Assert non-null with !
        currentIndex++
        await middleware(req, res, executeNext)
      }
    }

    await executeNext()
  }
}