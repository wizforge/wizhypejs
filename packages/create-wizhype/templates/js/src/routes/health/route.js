import { HypeResponse } from 'wizhypejs'

export async function GET(req) {
  return HypeResponse.json({ status: 'ok', uptime: process.uptime() })
}
