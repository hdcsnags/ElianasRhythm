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

const RELAY_URL = import.meta.env.VITE_LIVE_RELAY_URL ?? ''

type StateListener = (state: LiveSessionState) => void
type EventListener = (event: LiveStreamEvent) => void

class LiveServiceImpl implements LiveService {
  private ws: WebSocket | null = null
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

    if (!RELAY_URL) {
      // Graceful fallback: relay not configured — use mock response path
      // TODO [Phase 2]: Remove fallback once relay is deployed
      console.warn('[LiveService] VITE_LIVE_RELAY_URL not set — using safe fallback mock')
      this.runFallbackMock(config)
      return
    }

    try {
      const wsUrl = `${RELAY_URL}/live?sessionId=${config.sessionId}&mode=${config.mode}`
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        this.setState('listening')
        this.ws?.send(JSON.stringify({ type: 'session_start', payload: config }))
      }

      this.ws.onmessage = (evt) => {
        try {
          const event: LiveStreamEvent = JSON.parse(evt.data as string)
          this.handleIncomingEvent(event)
        } catch {
          console.error('[LiveService] Failed to parse WS message', evt.data)
        }
      }

      this.ws.onerror = () => {
        this.setState('error')
        this.emit({ type: 'error', payload: { code: 'WS_ERROR', message: 'WebSocket connection error' }, timestamp: Date.now() })
      }

      this.ws.onclose = () => {
        if (this.currentState !== 'error') {
          this.setState('disconnected')
        }
      }
    } catch (err) {
      console.error('[LiveService] Connection failed', err)
      this.setState('error')
      // Fallback to mock on connection failure
      this.runFallbackMock(config)
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
        // TODO [Phase 2]: Pause audio playback, resume listening
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

  // Fallback mock: simulates a brief Eliana response for demo resilience
  // This is NOT a substitute for the live path — it is for graceful degradation only
  private runFallbackMock(config: LiveSessionConfig) {
    setTimeout(() => {
      this.setState('listening')
      this.mockTimer = setTimeout(() => {
        this.setState('speaking')
        this.emit({
          type: 'transcript_final',
          payload: {
            text: 'Peace be with you. I\'m here and listening. The live connection is warming up — your presence is welcome.',
            speaker: 'assistant',
          },
          timestamp: Date.now(),
        })
        this.mockTimer = setTimeout(() => {
          this.setState('listening')
        }, 3000)
      }, 1500)
    }, 800)
    // Store fallback flag for UI
    void config
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
