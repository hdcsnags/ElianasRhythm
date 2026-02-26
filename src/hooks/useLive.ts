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
    const unsubState = liveService.onStateChange((s) => {
      setState(s)
      if (s === 'listening' || s === 'speaking') {
        setIsMicActive(liveService.isMicStarted())
      }
      if (s === 'disconnected' || s === 'idle' || s === 'error') {
        setIsMicActive(false)
      }
    })

    const unsubEvent = liveService.onEvent((event) => {
      optionsRef.current.onTranscriptEvent?.(event)

      if (event.type === 'fallback') {
        const payload = event.payload as { active?: boolean }
        setIsFallback(Boolean(payload.active))
      }

      if (event.type === 'error') {
        const payload = event.payload as { code?: string; message?: string }
        if (payload.code !== 'NO_PROVIDER') {
          optionsRef.current.onError?.(payload.message ?? 'Live session error')
        }
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
    setIsFallback(false)
  }, [])

  const sendInterrupt = useCallback(() => {
    liveService.sendInterrupt()
  }, [])

  const triggerHolyPause = useCallback(() => {
    // Holy Pause: send interrupt to relay, state returns to listening
    if (state === 'speaking') {
      liveService.sendInterrupt()
    }
  }, [state])

  // toggleMic is a UI mute concept — mic pipeline runs continuously once live,
  // but we track the visual state. Pressing during speaking triggers an interrupt.
  const toggleMic = useCallback(() => {
    if (state === 'idle' || state === 'disconnected') return
    if (state === 'speaking') {
      liveService.sendInterrupt()
    }
    setIsMicActive(prev => !prev)
  }, [state])

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
    sendInterrupt,
    triggerHolyPause,
  }
}
