// Eliana Live Session Relay
// Phase 1: WebSocket scaffold with mock response loop.
// Phase 2: Wire to live provider (e.g., Gemini Live API).
//
// Architecture:
//   Browser WebSocket → this relay → Live Provider WebSocket
//
// SECURITY: LIVE_PROVIDER_API_KEY stays server-side here. Never forwarded to client.

import { WebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'http'
import type { ClientConnection, RelayMessage } from './types.js'

const MOCK_RESPONSES_BY_MODE: Record<string, string[]> = {
  companion: [
    "Peace be with you. I'm here and listening.",
    "I hear you. Let's sit with that together.",
    "Your words are received with care.",
  ],
  bridge: [
    "I'm bridging this conversation with care.",
  ],
  tutor: [
    "Let's explore this passage together.",
  ],
}

function pickMockResponse(mode: string): string {
  const pool = MOCK_RESPONSES_BY_MODE[mode] ?? MOCK_RESPONSES_BY_MODE.companion
  return pool[Math.floor(Math.random() * pool.length)]
}

function send(ws: WebSocket, msg: RelayMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

export function createRelayServer(wss: WebSocketServer) {
  const connections = new Map<string, ClientConnection>()

  wss.on('connection', (clientWs: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
    const sessionId = url.searchParams.get('sessionId')
    const mode = url.searchParams.get('mode') ?? 'companion'
    const token = url.searchParams.get('token') ?? ''

    if (!sessionId) {
      clientWs.close(1008, 'Missing sessionId')
      return
    }

    // TODO [Phase 2]: Validate relay token (issued by relay-live-token Edge Function)
    // TODO [Phase 2]: Check token TTL and session binding
    void token

    const conn: ClientConnection = {
      sessionId,
      userId: 'pending-auth', // TODO [Phase 2]: Extract from validated token
      mode,
      socket: clientWs,
      connectedAt: new Date(),
    }
    connections.set(sessionId, conn)

    console.log(`[relay] Connected: session=${sessionId} mode=${mode}`)

    send(clientWs, {
      type: 'session_ready',
      payload: { sessionId, mode, phase: 1 },
      timestamp: Date.now(),
    })

    // TODO [Phase 2]: Open provider WebSocket here
    // const providerWs = new WebSocket(PROVIDER_WS_URL, { headers: { Authorization: `Bearer ${LIVE_PROVIDER_API_KEY}` } })
    // conn.providerSocket = providerWs
    // Forward events bidirectionally

    // Phase 1: Simulated response loop for demo resilience
    runMockResponseLoop(clientWs, mode)

    clientWs.on('message', (data) => {
      if (Buffer.isBuffer(data)) {
        // Audio chunk — TODO [Phase 2]: forward to provider WebSocket
        return
      }
      try {
        const msg = JSON.parse(data.toString()) as RelayMessage
        console.log(`[relay] Client msg: type=${msg.type} session=${sessionId}`)
        // TODO [Phase 2]: Route session_start config to provider
        // TODO [Phase 2]: Forward VAD events to provider
      } catch {
        // Ignore parse errors
      }
    })

    clientWs.on('close', () => {
      console.log(`[relay] Disconnected: session=${sessionId}`)
      connections.delete(sessionId)
      // TODO [Phase 2]: Close provider WebSocket gracefully
      // TODO [Phase 2]: Signal save-transcript Edge Function
    })

    clientWs.on('error', (err) => {
      console.error(`[relay] Error: session=${sessionId}`, err)
    })
  })

  return { connections }
}

function runMockResponseLoop(ws: WebSocket, mode: string) {
  setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) return

    send(ws, { type: 'assistant_start', payload: {}, timestamp: Date.now() })

    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) return
      send(ws, {
        type: 'transcript_final',
        payload: { text: pickMockResponse(mode), speaker: 'assistant' },
        timestamp: Date.now(),
      })
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        send(ws, { type: 'assistant_end', payload: {}, timestamp: Date.now() })
      }, 400)
    }, 1200)
  }, 800)
}
