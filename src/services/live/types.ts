// Live service types — contract for the relay WebSocket protocol

export type LiveSessionState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'speaking'
  | 'paused'
  | 'error'
  | 'disconnected'

export interface LiveSessionConfig {
  sessionId: string
  userId: string
  mode: 'companion' | 'bridge' | 'tutor'
}

export interface LiveStreamEvent {
  type:
    | 'session_ready'
    | 'fallback'
    | 'transcript_partial'
    | 'transcript_final'
    | 'assistant_start'
    | 'assistant_chunk'
    | 'assistant_end'
    | 'vad_speech_start'
    | 'vad_speech_end'
    | 'interruption'
    | 'error'
    | 'session_end'
  payload: unknown
  timestamp: number
}

export interface TranscriptPartialEvent {
  type: 'transcript_partial'
  payload: { text: string; speaker: 'user' | 'assistant' }
  timestamp: number
}

export interface TranscriptFinalEvent {
  type: 'transcript_final'
  payload: { text: string; speaker: 'user' | 'assistant'; messageId?: string }
  timestamp: number
}

export interface AssistantChunkEvent {
  type: 'assistant_chunk'
  payload: { text: string }
  timestamp: number
}

export interface ErrorEvent {
  type: 'error'
  payload: { code: string; message: string }
  timestamp: number
}

export interface FallbackEvent {
  type: 'fallback'
  payload: { active: boolean; reason?: string }
  timestamp: number
}

export interface InterruptionEvent {
  type: 'interruption'
  payload: { at_ms: number }
  timestamp: number
}

export interface LiveService {
  connect(config: LiveSessionConfig): Promise<void>
  disconnect(): void
  sendText(text: string): void
  sendAudioChunk(chunk: ArrayBuffer): void
  sendInterrupt(): void
  isConnected(): boolean
  isMicStarted(): boolean
  isUsingFallback(): boolean
  onStateChange(cb: (state: LiveSessionState) => void): () => void
  onEvent(cb: (event: LiveStreamEvent) => void): () => void
}