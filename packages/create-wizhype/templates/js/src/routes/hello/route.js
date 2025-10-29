import { HypeResponse } from 'wizhypejs'

export async function GET(req) {
  return HypeResponse.json({
    message: 'Hello from wizhypejs!',
    timestamp: new Date().toISOString(),
  })
}

export async function POST(req) {
  const body = await req.json()
  return HypeResponse.json(
    { message: 'Created', received: body },
    { status: 201 }
  )
}
