import { useEffect, useRef } from 'react'
import type { Message } from '../../lib/types'
import { formatTime, cn } from '../../lib/utils'

interface TranscriptPanelProps {
  messages: Message[]
  loading?: boolean
  partialText?: string
  isThinking?: boolean
}

export function TranscriptPanel({ messages, loading, partialText, isThinking }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, partialText, isThinking])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-cream/[0.28]">Loading conversation...</p>
      </div>
    )
  }

  if (messages.length === 0 && !partialText && !isThinking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
        <p className="text-cream/[0.28] leading-relaxed max-w-xs font-serif text-base">
          Begin a session to start a conversation with Eliana.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
      {messages.map((msg) => (
        <TranscriptMessage key={msg.id} message={msg} />
      ))}

      {partialText && (
        <div className="animate-msg-in flex flex-col gap-1">
          <div className="text-[0.55rem] font-display tracking-[0.25em] uppercase text-gold px-2">Eliana</div>
          <div className="bg-gold/[0.07] border border-gold/[0.14] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg px-4 py-3.5 max-w-[88%]">
            <p className="font-serif text-base text-cream leading-[1.65]">
              {partialText}
              <span className="inline-block w-1 h-3.5 bg-gold ml-0.5 animate-pulse rounded-sm" />
            </p>
          </div>
        </div>
      )}

      {isThinking && !partialText && (
        <div className="animate-msg-in flex flex-col gap-1">
          <div className="text-[0.55rem] font-display tracking-[0.25em] uppercase text-gold px-2">Eliana</div>
          <div className="flex items-center gap-1 px-4 py-3 bg-gold/[0.05] border border-gold/10 rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg w-fit">
            <div className="w-[5px] h-[5px] rounded-full bg-gold animate-typing-dot" />
            <div className="w-[5px] h-[5px] rounded-full bg-gold animate-typing-dot" style={{ animationDelay: '0.2s' }} />
            <div className="w-[5px] h-[5px] rounded-full bg-gold animate-typing-dot" style={{ animationDelay: '0.4s' }} />
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
    <div className="animate-msg-in flex flex-col gap-1">
      <div className={cn(
        'text-[0.55rem] font-display tracking-[0.25em] uppercase px-2',
        isUser ? 'text-cream/[0.28] text-right' : 'text-gold'
      )}>
        {isUser ? 'You' : 'Eliana'}
      </div>

      <div className={cn(
        'px-4 py-3.5 text-[0.88rem] leading-[1.65] max-w-[88%] relative',
        isUser
          ? 'bg-cream/[0.05] border border-cream/[0.08] rounded-tl-lg rounded-tr-none rounded-br-lg rounded-bl-lg self-end text-right text-cream/[0.65]'
          : 'bg-gold/[0.07] border border-gold/[0.14] rounded-tl-none rounded-tr-lg rounded-br-lg rounded-bl-lg self-start text-cream font-serif text-base'
      )}>
        {message.content}
      </div>

      <div className={cn(
        'text-[0.65rem] text-cream/[0.28] px-2',
        isUser && 'text-right'
      )}>
        {formatTime(message.created_at)}
      </div>
    </div>
  )
}
