// TODO [Phase 2]: Replace stubs with real WebSocket relay connection
// Architecture: browser WebSocket → Edge Function / Cloud Run relay → Live Provider WebSocket
//
// Security note: Provider API keys MUST remain server-side only.
// This service connects to the RELAY, not directly to the provider.

import type {
  LiveService,
  LiveSessionConfig,
  LiveSessionState,
  LiveStreamEvent,
} from './types'

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
  private mockTimer: ReturnType<typeof setTimeout> | null = null

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

    // 1) Obtain a short-lived relay token (server-side issuer) to avoid exposing provider keys in the browser.
    //    This token is validated by the relay (Phase 2), and can later be swapped for provider ephemeral tokens.
    let relayToken = ''
    let relayBaseUrl = (RELAY_URL ?? '').trim()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase.functions.invoke('relay-live-token', {
        body: { sessionId: config.sessionId, mode: config.mode },
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (error) {
        throw new Error(error.message)
      }

      relayToken = (data as any)?.token ?? ''
      const providedRelayUrl = (data as any)?.relayUrl ?? ''
      if (!relayBaseUrl && typeof providedRelayUrl === 'string') {
        relayBaseUrl = providedRelayUrl
      }
    } catch (err) {
      console.warn('[LiveService] Failed to get relay token — falling back', err)
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'token_unavailable' }, timestamp: Date.now() })
      await this.runFallback(config, 'token_unavailable')
      return
    }

    // 2) If relay URL is not configured, use fallback.
    if (!relayBaseUrl) {
      console.warn('[LiveService] Relay URL not configured — using fallback')
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'relay_url_missing' }, timestamp: Date.now() })
      await this.runFallback(config, 'relay_url_missing')
      return
    }

    // 3) Connect to relay via WebSocket.
    try {
      const trimmed = relayBaseUrl.replace(/\/$/, '')
      const wsUrl = `${trimmed}/live?sessionId=${encodeURIComponent(config.sessionId)}&mode=${encodeURIComponent(config.mode)}&token=${encodeURIComponent(relayToken)}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.setState('listening')
        this.emit({ type: 'fallback', payload: { active: false }, timestamp: Date.now() })
        this.ws?.send(JSON.stringify({ type: 'session_start', payload: config }))
      }

      this.ws.onmessage = (evt) => {
        try {
          const event = JSON.parse(evt.data as string) as any as LiveStreamEvent
          this.handleIncomingEvent(event)
        } catch {
          console.error('[LiveService] Failed to parse WS message', evt.data)
        }
      }

      this.ws.onerror = () => {
        this.setState('error')
        this.emit({ type: 'error', payload: { code: 'WS_ERROR', message: 'WebSocket connection error' }, timestamp: Date.now() })
      }

      this.ws.onclose = async () => {
        if (this.currentState !== 'error') {
          this.setState('disconnected')
        }
      }
    } catch (err) {
      console.error('[LiveService] Connection failed', err)
      this.setState('error')
      this.usingFallback = true
      this.emit({ type: 'fallback', payload: { active: true, reason: 'ws_connect_failed' }, timestamp: Date.now() })
      await this.runFallback(config, 'ws_connect_failed')
    }
  }

  private handleIncomingEvent(event: LiveStreamEvent) {
    // TODO [Phase 2]: Handle VAD, interruption, audio playback events
    switch (event.type) {
      case 'assistant_start':
        this.setState('speaking')
        break
      case 'assistant_end':
        this.setState('listening')
        break
      case 'interruption':
        this.setState('listening')
        break
      case 'session_end':
        this.setState('disconnected')
        break
      case 'error':
        this.setState('error')
        break
    }
    this.emit(event)
  }

  // Fallback: calls server-side Edge Function for a graceful response
  // This is NOT a substitute for the live path — it is for graceful degradation only.
  private async runFallback(config: LiveSessionConfig, reason?: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('safe-response-fallback', {
        body: { mode: config.mode, sessionId: config.sessionId, reason },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (error) throw new Error(error.message)

      const text = (data as any)?.text ?? (data as any)?.response ?? (data as any)?.message ?? "Peace be with you. I'm here and listening."
      this.setState('listening')
      this.setState('speaking')
      this.emit({
        type: 'transcript_final',
        payload: { text, speaker: 'assistant' },
        timestamp: Date.now(),
      })
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
    if (this.mockTimer) {
      clearTimeout(this.mockTimer)
      this.mockTimer = null
    }
    if (this.ws) {
      this.ws.onclose = null
      this.ws.close()
      this.ws = null
    }
    this.setState('disconnected')
  }

  // TODO [Phase 2]: Stream mic audio chunks to relay
  sendAudioChunk(chunk: ArrayBuffer): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(chunk)
    }
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

export const liveService: LiveService = new LiveServiceImpl()
export type { LiveSessionState, LiveStreamEvent, LiveSessionConfig }