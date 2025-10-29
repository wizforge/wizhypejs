import { HypeResponse } from 'wizhypejs'

export async function GET(req: any) {
  return HypeResponse.json({ status: 'ok', uptime: process.uptime() })
}
