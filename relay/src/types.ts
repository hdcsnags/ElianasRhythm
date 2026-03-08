export interface RelaySessionConfig {
  sessionId: string
  userId: string
  mode: 'companion' | 'bridge' | 'tutor'
  token: string
}

// Browser -> Relay messages
export interface BrowserMessage {
  type: 'session_start' | 'audio' | 'text' | 'interrupt' | 'session_end'
  sessionId?: string
  mode?: string
  userId?: string
  audio?: string
  text?: string
  mimeType?: string
}

// Relay -> Browser messages (Phase 2 protocol)
export interface RelayToClientMessage {
  type: 'ready' | 'transcript' | 'audio' | 'interrupted' | 'turn_complete' | 'error'
  text?: string
  final?: boolean
  speaker?: 'user' | 'assistant'
  audio?: string
  mimeType?: string
  code?: string
  message?: string
}

// Legacy fallback shape (kept for compat)
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
  providerSocket?: unknown // Gemini Live WebSocket
  audioBuffer?: Buffer[]
  isSpeaking?: boolean
}

export type RelayEventType =
  | 'ready'
  | 'transcript'
  | 'audio'
  | 'interrupted'
  | 'turn_complete'
  | 'error'
  | 'session_end'
