// Eliana Relay Server — Cloud Run entry point
// Phase 1 scaffold. See relay.ts for WebSocket relay logic.
//
// Deployment: Cloud Run (see Dockerfile + cloudbuild.yaml)
// min-instances: 1 configured in cloudbuild.yaml to avoid cold starts during demo/judging period.

import express from 'express'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import { createRelayServer } from './relay.js'

const PORT = parseInt(process.env.PORT ?? '8080', 10)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? '*'

const app = express()

app.use(cors({ origin: ALLOWED_ORIGIN }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eliana-relay', phase: 1, timestamp: new Date().toISOString() })
})

app.get('/', (_req, res) => {
  res.json({
    service: 'eliana-relay',
    phase: 1,
    wsPath: '/live',
    note: 'Connect via WebSocket at /live?sessionId=<id>&mode=<mode>&token=<token>',
  })
})

const server = createServer(app)

const wss = new WebSocketServer({ server, path: '/live' })
createRelayServer(wss)

server.listen(PORT, () => {
  console.log(`[relay] Eliana relay server listening on port ${PORT}`)
  console.log(`[relay] WebSocket path: /live`)
  console.log(`[relay] Phase 2 — Gemini Live relay active`)
  const hasKey = Boolean(process.env.LIVE_PROVIDER_API_KEY)
  console.log(`[relay] Provider API key: ${hasKey ? 'configured' : 'NOT SET — demo mode only'}`)
})

process.on('SIGTERM', () => {
  console.log('[relay] SIGTERM received — shutting down gracefully')
  server.close(() => process.exit(0))
})
