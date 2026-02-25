// Relay type contracts
// TODO [Phase 2]: Align with actual Gemini Live API message schema

export interface RelaySessionConfig {
  sessionId: string
  userId: string
  mode: 'companion' | 'bridge' | 'tutor'
  token: string
}

export interface RelayMessage {
  type: string
  payload: unknown
  timestamp: number
}

export interface ClientConnection {
  sessionId: string
  userId: string
  mode: string
  socket: unknown // WebSocket
  connectedAt: Date
  // TODO [Phase 2]: providerSocket: WebSocket (Gemini Live API connection)
}

export type RelayEventType =
  | 'session_ready'
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
