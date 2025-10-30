import type HypeRequest from './request.js'
import type { HypeResponseLike } from './response.js'

export type NextFunction = () => Promise<void>
export type MiddlewareFunction = (req: HypeRequest, res: HypeResponseLike, next: NextFunction) => Promise<any> | any

export class MiddlewareChain {
  private middlewares: MiddlewareFunction[] = []

  use(middleware: MiddlewareFunction) {
    this.middlewares.push(middleware)
    return this
  }

  async execute(req: HypeRequest, res: HypeResponseLike): Promise<any> {
    let currentIndex = 0

    const executeNext = async (): Promise<any> => {
      while (currentIndex < this.middlewares.length) {
        const middleware = this.middlewares[currentIndex]!
        currentIndex++
        const result = await middleware(req, res, executeNext)
        if (result !== undefined) {
          // Stop the chain and return the response if not undefined
          return result
        }
      }
      return undefined
    }

    return await executeNext()
  }
}