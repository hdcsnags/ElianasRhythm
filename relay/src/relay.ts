// Eliana Live Session Relay — Phase 2 (Google GenAI SDK)
// Architecture: Browser WS ↔ this relay ↔ Gemini Live (via @google/genai SDK)
// Provider API keys stay server-side only, never forwarded to clients.

import { GoogleGenAI, Modality, type Session } from '@google/genai'
import { WebSocket, WebSocketServer } from 'ws'
import type { IncomingMessage } from 'http'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { ClientConnection, RelayToClientMessage, BrowserMessage } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROVIDER_API_KEY = process.env.LIVE_PROVIDER_API_KEY ?? ''
const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const GEMINI_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'

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

function decodeJwtUserId(token: string): string | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = Buffer.from(parts[1], 'base64url').toString('utf-8')
    const decoded = JSON.parse(payload) as { sub?: string }
    return decoded.sub ?? null
  } catch (err) {
    console.error('[relay] JWT decode failed:', err)
    return null
  }
}

async function verifyToken(token: string, sessionId: string): Promise<{ userId: string } | null> {
  try {
    const userId = decodeJwtUserId(token)
    if (!userId) {
      console.error('[relay] verifyToken: could not decode user ID from JWT')
      return null
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('[relay] verifyToken: SUPABASE_URL or SUPABASE_ANON_KEY not set — skipping session check')
      return { userId }
    }

    const sessRes = await fetch(
      `${SUPABASE_URL}/rest/v1/sessions?id=eq.${encodeURIComponent(sessionId)}&user_id=eq.${encodeURIComponent(userId)}&select=id`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
          Accept: 'application/json',
        },
      }
    )
    if (!sessRes.ok) {
      const errBody = await sessRes.text()
      console.error('[relay] verifyToken session check failed:', sessRes.status, sessRes.statusText, errBody)
      return null
    }
    const sessions = await sessRes.json() as unknown[]
    if (!Array.isArray(sessions) || sessions.length === 0) {
      console.error('[relay] verifyToken: session not found for user', userId, 'session', sessionId)
      return null
    }

    return { userId }
  } catch (err) {
    console.error('[relay] verifyToken error:', err)
    return null
  }
}

async function connectToGemini(
  conn: ClientConnection,
  clientWs: WebSocket,
  mode: string,
  systemPrompt: string
): Promise<Session | null> {
  if (!PROVIDER_API_KEY) {
    console.warn('[relay] LIVE_PROVIDER_API_KEY not set — Gemini connection skipped')
    return null
  }

  const ai = new GoogleGenAI({ apiKey: PROVIDER_API_KEY })
  let assistantAudioActive = false

  try {
    const session = await ai.live.connect({
      model: GEMINI_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Aoede' },
          },
        },
        systemInstruction: systemPrompt,
      },
      callbacks: {
        onopen() {
          console.log(`[relay] Gemini Live connected — session=${conn.sessionId}`)
          sendToClient(clientWs, { type: 'ready' })
        },
        onmessage(msg) {
          try {
            const sc = msg.serverContent
            if (!sc) return

            const parts = sc.modelTurn?.parts
            if (Array.isArray(parts)) {
              for (const part of parts) {
                if (part.text && typeof part.text === 'string') {
                  sendToClient(clientWs, {
                    type: 'transcript',
                    text: part.text,
                    final: false,
                    speaker: 'assistant',
                  })
                }
                if (part.inlineData) {
                  if (!assistantAudioActive) {
                    assistantAudioActive = true
                  }
                  sendToClient(clientWs, {
                    type: 'audio',
                    audio: part.inlineData.data,
                    mimeType: 'audio/pcm;rate=24000',
                  })
                }
              }
            }

            if (sc.turnComplete === true) {
              assistantAudioActive = false
              sendToClient(clientWs, { type: 'turn_complete' })
            }

            if (sc.interrupted === true) {
              assistantAudioActive = false
              sendToClient(clientWs, { type: 'interrupted' })
            }

            if (sc.inputTranscription?.text) {
              sendToClient(clientWs, {
                type: 'transcript',
                text: sc.inputTranscription.text,
                final: Boolean(sc.inputTranscription.finished),
                speaker: 'user',
              })
            }

            if (sc.outputTranscription?.text) {
              sendToClient(clientWs, {
                type: 'transcript',
                text: sc.outputTranscription.text,
                final: Boolean(sc.outputTranscription.finished),
                speaker: 'assistant',
              })
            }
          } catch (err) {
            console.error('[relay] Error handling Gemini message', err)
          }
        },
        onerror(err) {
          console.error(`[relay] Gemini Live error — session=${conn.sessionId}`, err)
          sendToClient(clientWs, {
            type: 'error',
            code: 'PROVIDER_ERROR',
            message: 'Provider connection error',
          })
        },
        onclose(event) {
          console.log(`[relay] Gemini Live closed — session=${conn.sessionId}`)
          if (clientWs.readyState === WebSocket.OPEN) {
            sendToClient(clientWs, { type: 'error', code: 'PROVIDER_CLOSED', message: 'Provider disconnected' })
          }
        },
      },
    })

    return session
  } catch (err) {
    console.error('[relay] Failed to connect to Gemini Live', err)
    return null
  }
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
    const session = await connectToGemini(conn, clientWs, mode, systemPrompt)
    if (session) {
      conn.providerSocket = session
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
        const providerSession = conn.providerSocket as Session | undefined

        if (msg.type === 'audio') {
          if (!msg.audio) return
          providerSession?.sendRealtimeInput({
            media: { mimeType: 'audio/pcm;rate=16000', data: msg.audio },
          })
          return
        }

        if (msg.type === 'text') {
          const text = msg.text
          if (!text) return
          providerSession?.sendClientContent({
            turns: [{ role: 'user', parts: [{ text }] }],
            turnComplete: true,
          })
          return
        }

        if (msg.type === 'interrupt') {
          conn.isSpeaking = false
          providerSession?.sendClientContent({ turnComplete: true })
          sendToClient(clientWs, { type: 'interrupted' })
          return
        }

        if (msg.type === 'session_end') {
          providerSession?.close()
          return
        }
      } catch {
        // ignore parse errors
      }
    })

    clientWs.on('close', () => {
      console.log(`[relay] Client disconnected: session=${sessionId}`)
      const providerSession = conn.providerSocket as Session | undefined
      providerSession?.close()
      connections.delete(sessionId)
    })

    clientWs.on('error', (err) => {
      console.error(`[relay] Client WS error: session=${sessionId}`, err)
    })
  })

  return { connections }
}
