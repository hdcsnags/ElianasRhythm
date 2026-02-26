import { useState, useEffect, useRef, useCallback } from 'react'
import { liveService } from '../services/live'
import type { LiveSessionState, LiveStreamEvent, LiveSessionConfig } from '../services/live'

interface UseLiveOptions {
  onTranscriptEvent?: (event: LiveStreamEvent) => void
  onError?: (message: string) => void
}

export function useLive(options: UseLiveOptions = {}) {
  const [state, setState] = useState<LiveSessionState>('idle')
  const [isMicActive, setIsMicActive] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const configRef = useRef<LiveSessionConfig | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  useEffect(() => {
    const unsubState = liveService.onStateChange(setState)
    const unsubEvent = liveService.onEvent((event) => {
      optionsRef.current.onTranscriptEvent?.(event)

      if (event.type === 'fallback') {
        const payload = event.payload as { active?: boolean }
        setIsFallback(Boolean(payload.active))
      }

      if (event.type === 'error') {
        const payload = event.payload as { message?: string }
        optionsRef.current.onError?.(payload.message ?? 'Live session error')
      }
    })
    return () => {
      unsubState()
      unsubEvent()
    }
  }, [])

  const connect = useCallback(async (config: LiveSessionConfig) => {
    configRef.current = config
    try {
      await liveService.connect(config)
      setIsFallback(liveService.isUsingFallback())
    } catch (err) {
      optionsRef.current.onError?.(err instanceof Error ? err.message : 'Failed to connect')
    }
  }, [])

  const disconnect = useCallback(() => {
    liveService.disconnect()
    setIsMicActive(false)
  }, [])

  // TODO [Phase 2]: Wire mic capture to actual MediaStream + AudioWorklet
  // For Phase 1: toggle mic active state as a UI stub
  const toggleMic = useCallback(() => {
    if (state === 'idle' || state === 'disconnected') return
    setIsMicActive(prev => !prev)
    // TODO [Phase 2]: start/stop sending audio chunks to relay
  }, [state])

  // TODO [Phase 2]: Holy Pause behavior
  const triggerHolyPause = useCallback(() => {
    // Placeholder — state goes to 'paused' briefly then resumes
  }, [])

  return {
    state,
    isMicActive,
    isFallback,
    isConnecting: state === 'connecting',
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    isPaused: state === 'paused',
    isError: state === 'error',
    isActive: state !== 'idle' && state !== 'disconnected',
    connect,
    disconnect,
    toggleMic,
    triggerHolyPause,
  }
}