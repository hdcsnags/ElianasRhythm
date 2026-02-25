import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { formatTime } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface TranscriptPanelProps {
  messages: Message[]
  loading?: boolean
  partialText?: string
}

export function TranscriptPanel({ messages, loading, partialText }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partialText])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-stone-400">Loading conversation…</p>
      </div>
    )
  }

  if (messages.length === 0 && !partialText) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <p className="text-sm text-stone-400 leading-relaxed max-w-xs">
          Begin a session to start a conversation with Eliana.
          <br />
          Your transcript will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((msg) => (
        <TranscriptMessage key={msg.id} message={msg} />
      ))}
      {partialText && (
        <div className="flex justify-start">
          <div className="max-w-[80%] bg-amber-50 border border-amber-100 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-stone-700 leading-relaxed">
              {partialText}
              <span className="inline-block w-1 h-3.5 bg-amber-400 ml-0.5 animate-pulse rounded-sm" />
            </p>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

function TranscriptMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 space-y-1',
        isUser
          ? 'bg-stone-800 text-white rounded-tr-sm'
          : 'bg-amber-50 border border-amber-100 text-stone-800 rounded-tl-sm'
      )}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={cn('text-xs', isUser ? 'text-stone-400' : 'text-stone-400')}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}
