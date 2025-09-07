import { NextRequest } from 'next/server'

// This is a mock SSE endpoint for local dev.
// It streams a simple string response token-by-token to emulate an AI.
export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const text = `Echo: ${prompt} `
      for (const ch of text) {
        controller.enqueue(encoder.encode(ch))
        await new Promise(r => setTimeout(r, 25))
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    }
  })
}