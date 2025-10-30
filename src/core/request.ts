export type RawRequestShape = {
  method: string
  url: string
  headers: Record<string, string | string[] | undefined>
  body: string | undefined
}

export class HypeRequest {
  method: string
  url: string
  headers: Record<string, string | undefined>
  /** route params extracted from dynamic route segments */
  params: Record<string, string>
  /** raw request body */
  body: string | undefined

  constructor(raw: RawRequestShape & { params?: Record<string, string> } ) {
    this.method = raw.method
    this.url = raw.url
    // normalize headers to string | undefined
    this.headers = Object.fromEntries(Object.entries(raw.headers || {}).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(',') : (v ?? undefined)]))
    this.body = raw.body
    this.params = raw.params ?? {}
  }

  async json<T = any>(): Promise<T | undefined> {
    if (!this.body) return undefined
    try {
      return JSON.parse(this.body) as T
    } catch (err) {
      throw new Error('Invalid JSON body')
    }
  }

  async text(): Promise<string> {
    return this.body ?? ''
  }
}

export default HypeRequest
