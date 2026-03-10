import { useEffect, useRef } from 'react'

const HEIGHTS = [8, 14, 20, 28, 22, 16, 24, 30, 18, 12, 26, 20, 14, 22, 16]

export function Waveform({ visible, speaking }: { visible: boolean; speaking?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initialized.current) return
    initialized.current = true

    HEIGHTS.forEach((h) => {
      const bar = document.createElement('div')
      bar.className = 'wave-bar'
      bar.style.setProperty('--wave-dur', `${0.6 + Math.random() * 0.8}s`)
      bar.style.setProperty('--wave-delay', `-${Math.random() * 0.8}s`)
      bar.style.setProperty('--wave-height', `${h}px`)
      containerRef.current!.appendChild(bar)
    })
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const bars = containerRef.current.querySelectorAll('.wave-bar')
    bars.forEach((bar) => {
      ;(bar as HTMLElement).style.background = speaking ? '#FFE89A' : '#C9A84C'
    })
  }, [speaking])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-[3px] h-8 transition-opacity duration-400"
      style={{
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
