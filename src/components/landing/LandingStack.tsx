const pills = [
  { label: 'Gemini Live API', highlight: true },
  { label: 'Cloud Run', highlight: true },
  { label: 'Cloud Build', highlight: true },
  { label: 'React + Vite', highlight: false },
  { label: 'TypeScript', highlight: false },
  { label: 'WebSocket Relay', highlight: false },
  { label: 'AudioWorklet', highlight: false },
  { label: 'Supabase', highlight: false },
  { label: 'Cloudflare Pages', highlight: false },
  { label: 'Row Level Security', highlight: false },
  { label: 'Edge Functions', highlight: false },
  { label: 'PCM16 Audio Pipeline', highlight: false },
]

export function LandingStack() {
  return (
    <section className="bg-deep py-24 px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="reveal">
          <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
            Technology
            <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
          </div>
          <h2 className="font-serif font-light text-cream" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Built on Google Cloud
          </h2>
        </div>

        <div className="reveal flex flex-wrap gap-3 mt-12" style={{ transitionDelay: '0.1s' }}>
          {pills.map((p) => (
            <div
              key={p.label}
              className={`px-5 py-2 border font-display text-[0.6rem] tracking-[0.2em] text-gold uppercase transition-all hover:bg-gold/[0.12] ${
                p.highlight
                  ? 'bg-gold/[0.12] border-gold/40'
                  : 'border-gold/20'
              }`}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
