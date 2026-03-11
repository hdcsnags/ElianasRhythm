// Eliana Live Service — Phase 2
// Architecture: browser WebSocket → Cloud Run relay → Gemini Live WS
// Provider API keys stay server-side only.

import type {
  LiveService,
  LiveSessionConfig,
  LiveSessionState,
  LiveStreamEvent,
} from './types'

import { MicPipeline, PlaybackQueue } from './audioPipeline'
import { supabase } from '../../lib/supabase/client'

const RELAY_URL = import.meta.env.VITE_LIVE_RELAY_URL ?? ''

type StateListener = (state: LiveSessionState) => void
type EventListener = (event: LiveStreamEvent) => void

class LiveServiceImpl implements LiveService {
  private ws: WebSocket | null = null
  private usingFallback = false
  private stateListeners: StateListener[] = []
  private eventListeners: EventListener[] = []
  private currentState: LiveSessionState = 'idle'
  private mic: MicPipeline | null = null
  private playback: PlaybackQueue | null = null
  private micStarted = false

  private setState(state: LiveSessionState) {
    this.currentState = state
    this.stateListeners.forEach(cb => cb(state))
  }

  private emit(event: LiveStreamEvent) {
    this.eventListeners.forEach(cb => cb(event))
  }

  async connect(config: LiveSessionConfig): Promise<void> {
    this.setState('connecting')
    this.usingFallback = false

    let relayToken = ''
    let relayBaseUrl = RELAY_URL.trim()

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession?.access_token) throw new Error('Not authenticated')

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/relay-live-token`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ sessionId: config.sessionId, mode: config.mode }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`Edge Function returned a non-2xx status code: ${res.status} ${errBody}`)
      }

      const data = await res.json()

      relayToken = (data as { token?: string })?.token ?? ''
      const providedUrl = (data as { relayUrl?: string })?.relayUrl ?? ''
      if (!relayBaseUrl && providedUrl) relayBaseUrl = providedUrl
    } catch (err) {
      console.warn('[LiveService] Token fetch failed — falling back', err)
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'token_unavailable' }, timestamp: Date.now() })
      await this.runFallback(config, 'token_unavailable')
      return
    }

    if (!relayBaseUrl) {
      console.warn('[LiveService] Relay URL not configured — using fallback')
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'relay_url_missing' }, timestamp: Date.now() })
      await this.runFallback(config, 'relay_url_missing')
      return
    }

    try {
      const base = relayBaseUrl.replace(/\/$/, '')
      const wsUrl = `${base}/live?sessionId=${encodeURIComponent(config.sessionId)}&mode=${encodeURIComponent(config.mode)}&token=${encodeURIComponent(relayToken)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.ws?.send(JSON.stringify({
          type: 'session_start',
          sessionId: config.sessionId,
          mode: config.mode,
          userId: config.userId,
        }))
      }

      this.ws.onmessage = (evt) => {
        try {
          this.handleRelayEvent(JSON.parse(evt.data as string) as Record<string, unknown>)
        } catch {
          console.error('[LiveService] WS parse error', evt.data)
        }
      }

      this.ws.onerror = () => {
        this.setState('error')
        this.emit({ type: 'error', payload: { code: 'WS_ERROR', message: 'WebSocket connection error' }, timestamp: Date.now() })
      }

      this.ws.onclose = () => {
        if (this.currentState !== 'error') this.setState('disconnected')
        this.stopMic()
        this.playback?.stop()
      }
    } catch (err) {
      console.error('[LiveService] Connection failed', err)
      this.setState('error')
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'ws_connect_failed' }, timestamp: Date.now() })
      await this.runFallback(config, 'ws_connect_failed')
    }
  }

  private handleRelayEvent(msg: Record<string, unknown>) {
    const type = msg.type as string

    switch (type) {
      case 'ready':
        this.setState('listening')
        this.emit({ type: 'fallback', payload: { active: false }, timestamp: Date.now() })
        this.startMicAndPlayback()
        break

      case 'audio': {
        const audio = msg.audio as string | undefined
        if (audio) {
          if (this.currentState !== 'speaking') this.setState('speaking')
          this.playback?.enqueue(audio)
        }
        break
      }

      case 'transcript':
        if (msg.final) {
          this.emit({
            type: 'transcript_final',
            payload: { text: msg.text ?? '', speaker: msg.speaker ?? 'assistant' },
            timestamp: Date.now(),
          })
        } else {
          this.emit({
            type: 'transcript_partial',
            payload: { text: msg.text ?? '', speaker: msg.speaker ?? 'assistant' },
            timestamp: Date.now(),
          })
        }
        break

      case 'turn_complete':
        this.setState('listening')
        break

      case 'interrupted':
        this.playback?.interrupt()
        this.setState('listening')
        this.emit({ type: 'interruption', payload: { at_ms: Date.now() }, timestamp: Date.now() })
        break

      case 'error': {
        const code = msg.code as string
        if (code === 'NO_PROVIDER') {
          this.emit({ type: 'fallback', payload: { active: true, reason: 'no_provider' }, timestamp: Date.now() })
          this.usingFallback = true
        } else {
          this.setState('error')
        }
        this.emit({ type: 'error', payload: { code, message: msg.message ?? 'Relay error' }, timestamp: Date.now() })
        break
      }

      case 'session_end':
        this.setState('disconnected')
        break
    }
  }

  private async startMicAndPlayback() {
    this.playback = new PlaybackQueue()
    this.playback.start()

    this.mic = new MicPipeline((base64) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'audio',
          audio: base64,
          mimeType: 'audio/pcm;rate=16000',
        }))
      }
    })

    try {
      await this.mic.start()
      this.micStarted = true
    } catch (err) {
      console.error('[LiveService] Mic start failed', err)
      this.emit({ type: 'error', payload: { code: 'MIC_ERROR', message: 'Microphone access denied or failed' }, timestamp: Date.now() })
    }
  }

  private stopMic() {
    if (this.mic) {
      this.mic.stop()
      this.mic = null
    }
    this.micStarted = false
  }

  private async runFallback(config: LiveSessionConfig, reason?: string) {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      if (!authSession?.access_token) throw new Error('Not authenticated')

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/safe-response-fallback`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ mode: config.mode, sessionId: config.sessionId, reason }),
      })

      if (!res.ok) throw new Error(`Fallback returned ${res.status}`)
      const data = await res.json()

      const text = (data as { text?: string; response?: string; message?: string })?.text
        ?? (data as { text?: string; response?: string; message?: string })?.response
        ?? (data as { text?: string; response?: string; message?: string })?.message
        ?? "Peace be with you. I'm here and listening."

      this.setState('listening')
      this.setState('speaking')
      this.emit({ type: 'transcript_final', payload: { text, speaker: 'assistant' }, timestamp: Date.now() })
      setTimeout(() => {
        if (this.currentState !== 'error') this.setState('listening')
      }, 800)
    } catch (err) {
      console.error('[LiveService] Fallback failed', err)
      this.setState('error')
      this.emit({ type: 'error', payload: { code: 'FALLBACK_FAILED', message: 'Fallback failed' }, timestamp: Date.now() })
    }
  }

  disconnect(): void {
    this.stopMic()
    this.playback?.stop()
    this.playback = null
    if (this.ws) {
      this.ws.onclose = null
      try { this.ws.send(JSON.stringify({ type: 'session_end' })) } catch { /* ignore */ }
      this.ws.close()
      this.ws = null
    }
    this.setState('disconnected')
  }

  sendText(text: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', text }))
    }
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(chunk)
    }
  }

  sendInterrupt(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }))
    }
    this.playback?.interrupt()
    this.setState('listening')
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && !this.usingFallback
  }

  isMicStarted(): boolean {
    return this.micStarted
  }

  isUsingFallback(): boolean {
    return this.usingFallback
  }

  onStateChange(cb: StateListener): () => void {
    this.stateListeners.push(cb)
    cb(this.currentState)
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== cb)
    }
  }

  onEvent(cb: EventListener): () => void {
    this.eventListeners.push(cb)
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== cb)
    }
  }
}

export const liveService = new LiveServiceImpl()
export type { LiveSessionState, LiveStreamEvent, LiveSessionConfig }
