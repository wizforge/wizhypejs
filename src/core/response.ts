export type HypeResponseLike = {
  type: 'json' | 'text'
  body: string
  status?: number
  headers?: Record<string, string>
}

export class HypeResponse {
  static json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) : HypeResponseLike {
    const body = JSON.stringify(data)
    return {
      type: 'json',
      body,
      status: init.status ?? 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...(init.headers ?? {}) }
    }
  }

  static text(data: string, init: { status?: number; headers?: Record<string, string> } = {}) : HypeResponseLike {
    return {
      type: 'text',
      body: data,
      status: init.status ?? 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...(init.headers ?? {}) }
    }
  }
}

export default HypeResponse
