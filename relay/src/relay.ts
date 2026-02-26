// Eliana Live Session Relay — Phase 2
// Architecture: Browser WS ↔ this relay ↔ Gemini Live WS
// Provider API keys stay server-side only, never forwarded to clients.

import { WebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'http'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { ClientConnection, RelayToClientMessage, BrowserMessage } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROVIDER_API_KEY = process.env.LIVE_PROVIDER_API_KEY ?? ''
const PROVIDER_WS_URL =
  process.env.LIVE_PROVIDER_WS_URL ??
  'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent'
const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

function loadPrompt(mode: string): string {
  try {
    const promptPath = join(__dirname, '..', 'prompts', `${mode}.txt`)
    return readFileSync(promptPath, 'utf-8').trim()
  } catch {
    return "You are Eliana, a calm and compassionate spiritual companion. Listen deeply and respond with warmth."
  }
}

function sendToClient(ws: WebSocket, msg: RelayToClientMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg))
  }
}

async function verifyToken(token: string, sessionId: string): Promise<{ userId: string } | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    })
    if (!res.ok) return null
    const user = await res.json() as { id?: string }
    if (!user?.id) return null

    const sessRes = await fetch(
      `${SUPABASE_URL}/rest/v1/sessions?id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${encodeURIComponent(user.id)}&select=id`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: SUPABASE_ANON_KEY,
          Accept: 'application/json',
        },
      }
    )
    if (!sessRes.ok) return null
    const sessions = await sessRes.json() as unknown[]
    if (!Array.isArray(sessions) || sessions.length === 0) return null

    return { userId: user.id }
  } catch {
    return null
  }
}

function buildGeminiSetupMessage(mode: string, systemPrompt: string) {
  return {
    setup: {
      model: 'models/gemini-2.0-flash-live-001',
      generation_config: {
        response_modalities: ['AUDIO', 'TEXT'],
        speech_config: {
          voice_config: {
            prebuilt_voice_config: { voice_name: 'Aoede' },
          },
        },
      },
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      tools: [],
    },
  }
}

function connectToGemini(
  conn: ClientConnection,
  clientWs: WebSocket,
  mode: string,
  systemPrompt: string
): WebSocket | null {
  if (!PROVIDER_API_KEY) {
    console.warn('[relay] LIVE_PROVIDER_API_KEY not set — Gemini connection skipped')
    return null
  }

  const url = `${PROVIDER_WS_URL}?key=${PROVIDER_API_KEY}`

  let providerWs: WebSocket
  try {
    providerWs = new WebSocket(url)
  } catch (err) {
    console.error('[relay] Failed to create Gemini WebSocket', err)
    return null
  }

  providerWs.on('open', () => {
    console.log(`[relay] Gemini WS open — session=${conn.sessionId}`)
    providerWs.send(JSON.stringify(buildGeminiSetupMessage(mode, systemPrompt)))
  })

  let assistantAudioActive = false

  providerWs.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString()) as Record<string, unknown>

      if (msg.setupComplete) {
        sendToClient(clientWs, { type: 'ready' })
        return
      }

      if (msg.serverContent) {
        const sc = msg.serverContent as Record<string, unknown>

        const parts = (sc.modelTurn as Record<string, unknown> | undefined)?.parts
        if (Array.isArray(parts)) {
          for (const part of parts as Record<string, unknown>[]) {
            if (part.text && typeof part.text === 'string') {
              sendToClient(clientWs, {
                type: 'transcript',
                text: part.text,
                final: false,
                speaker: 'assistant',
              })
            }
            if (part.inlineData) {
              const d = part.inlineData as Record<string, string>
              if (!assistantAudioActive) {
                assistantAudioActive = true
              }
              sendToClient(clientWs, {
                type: 'audio',
                audio: d.data,
                mimeType: 'audio/pcm;rate=24000',
              })
            }
          }
        }

        if (sc.turnComplete === true) {
          if (assistantAudioActive) {
            assistantAudioActive = false
          }
          sendToClient(clientWs, { type: 'turn_complete' })
        }

        if (sc.interrupted === true) {
          assistantAudioActive = false
          sendToClient(clientWs, { type: 'interrupted' })
        }

        const inputTranscription = sc.inputTranscription as Record<string, unknown> | undefined
        if (inputTranscription?.text) {
          sendToClient(clientWs, {
            type: 'transcript',
            text: inputTranscription.text as string,
            final: Boolean((inputTranscription as Record<string, unknown>).isFinal),
            speaker: 'user',
          })
        }

        const outputTranscription = sc.outputTranscription as Record<string, unknown> | undefined
        if (outputTranscription?.text) {
          sendToClient(clientWs, {
            type: 'transcript',
            text: outputTranscription.text as string,
            final: Boolean((outputTranscription as Record<string, unknown>).isFinal),
            speaker: 'assistant',
          })
        }
      }
    } catch (err) {
      console.error('[relay] Error parsing Gemini message', err)
    }
  })

  providerWs.on('error', (err) => {
    console.error(`[relay] Gemini WS error — session=${conn.sessionId}`, err)
    sendToClient(clientWs, {
      type: 'error',
      code: 'PROVIDER_ERROR',
      message: 'Provider connection error',
    })
  })

  providerWs.on('close', (code) => {
    console.log(`[relay] Gemini WS closed — session=${conn.sessionId} code=${code}`)
    if (clientWs.readyState === WebSocket.OPEN) {
      sendToClient(clientWs, { type: 'error', code: 'PROVIDER_CLOSED', message: 'Provider disconnected' })
    }
  })

  return providerWs
}

export function createRelayServer(wss: WebSocketServer) {
  const connections = new Map<string, ClientConnection>()

  wss.on('connection', async (clientWs: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
    const sessionId = url.searchParams.get('sessionId')
    const mode = (url.searchParams.get('mode') ?? 'companion') as 'companion' | 'bridge' | 'tutor'
    const token = url.searchParams.get('token') ?? ''

    if (!sessionId) {
      clientWs.close(1008, 'Missing sessionId')
      return
    }

    if (!token) {
      clientWs.close(1008, 'Missing token')
      return
    }

    const auth = await verifyToken(token, sessionId)
    if (!auth) {
      clientWs.close(1008, 'Unauthorized')
      return
    }

    const conn: ClientConnection = {
      sessionId,
      userId: auth.userId,
      mode,
      socket: clientWs,
      connectedAt: new Date(),
      isSpeaking: false,
    }
    connections.set(sessionId, conn)
    console.log(`[relay] Connected: session=${sessionId} mode=${mode} user=${auth.userId}`)

    const systemPrompt = loadPrompt(mode)
    const providerWs = connectToGemini(conn, clientWs, mode, systemPrompt)
    if (providerWs) {
      conn.providerSocket = providerWs
    } else {
      sendToClient(clientWs, { type: 'ready' })
      sendToClient(clientWs, {
        type: 'error',
        code: 'NO_PROVIDER',
        message: 'Live provider not configured — relay in demo mode',
      })
    }

    clientWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString()) as BrowserMessage

        if (msg.type === 'audio') {
          if (!msg.audio) return
          const provider = conn.providerSocket as WebSocket | undefined
          if (provider?.readyState === WebSocket.OPEN) {
            provider.send(
              JSON.stringify({
                realtimeInput: {
                  mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: msg.audio }],
                },
              })
            )
          }
          return
        }

        if (msg.type === 'interrupt') {
          conn.isSpeaking = false
          const provider = conn.providerSocket as WebSocket | undefined
          if (provider?.readyState === WebSocket.OPEN) {
            provider.send(JSON.stringify({ clientContent: { turnComplete: true } }))
          }
          sendToClient(clientWs, { type: 'interrupted' })
          return
        }

        if (msg.type === 'session_end') {
          const provider = conn.providerSocket as WebSocket | undefined
          provider?.close()
          return
        }
      } catch {
        // ignore parse errors
      }
    })

    clientWs.on('close', () => {
      console.log(`[relay] Client disconnected: session=${sessionId}`)
      const provider = conn.providerSocket as WebSocket | undefined
      if (provider && provider.readyState === WebSocket.OPEN) {
        provider.close()
      }
      connections.delete(sessionId)
    })

    clientWs.on('error', (err) => {
      console.error(`[relay] Client WS error: session=${sessionId}`, err)
    })
  })

  return { connections }
}
