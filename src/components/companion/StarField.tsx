import { useEffect, useRef } from 'react'

export function StarField({ count = 90 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!containerRef.current || initialized.current) return
    initialized.current = true

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div')
      star.className = 'star'
      const size = Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1
      star.style.left = `${Math.random() * 100}%`
      star.style.top = `${Math.random() * 100}%`
      star.style.width = `${size}px`
      star.style.height = `${size}px`
      star.style.setProperty('--star-dur', `${2.5 + Math.random() * 4}s`)
      star.style.setProperty('--star-delay', `-${Math.random() * 4}s`)
      star.style.setProperty('--star-opacity', `${0.08 + Math.random() * 0.35}`)
      containerRef.current.appendChild(star)
    }
  }, [count])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
}
