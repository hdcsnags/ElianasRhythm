export function LandingUiPreview() {
  return (
    <section className="py-32 px-8 max-w-[1100px] mx-auto">
      <div className="reveal">
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
          Interface
          <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
        </div>
        <h2 className="font-serif font-light leading-[1.15] text-cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
          Presence, not<br /><em className="italic text-gold-soft">a product</em>
        </h2>
      </div>

      <div className="reveal mt-16 bg-surface border border-gold/[0.15] overflow-hidden relative" style={{ transitionDelay: '0.2s' }}>
        <div className="bg-deep px-6 py-3.5 flex items-center gap-2 border-b border-gold/10">
          <div className="w-2.5 h-2.5 rounded-full bg-cream/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-cream/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-cream/10" />
          <div className="flex-1 text-center text-[0.7rem] text-cream/30 tracking-wide">
            eliana.thamos.ca — Companion Session
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] min-h-[520px]">
          <div className="hidden md:flex flex-col gap-2 bg-night/80 border-r border-gold/[0.08] p-8">
            <div className="font-serif text-[1.4rem] text-cream mb-1">Eliana</div>
            <div className="text-[0.7rem] text-cream/30 tracking-wide mb-8">Spiritual Companion</div>
            <SidebarItem label="Companion" active />
            <SidebarItem label="History" />
            <SidebarItem label="Settings" />
          </div>

          <div className="flex flex-col items-center gap-8 p-12">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-[130px] h-[130px] rounded-full border border-gold/[0.12] animate-ring-pulse" />
              <div className="absolute w-[160px] h-[160px] rounded-full border border-gold/[0.06] animate-ring-pulse" style={{ animationDelay: '0.6s' }} />
              <div
                className="w-[90px] h-[90px] rounded-full relative z-[1]"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #E8C96A, #C9A84C 40%, #8B6520)',
                  boxShadow: '0 0 40px rgba(201,168,76,0.35), 0 0 80px rgba(201,168,76,0.1)',
                  animation: 'orbBreathe 3s ease-in-out infinite',
                }}
              />
            </div>

            <div className="font-display text-[0.6rem] tracking-[0.3em] text-gold uppercase">
              Listening
            </div>

            <div className="w-full max-w-[480px] flex flex-col gap-3">
              <div className="px-5 py-4 bg-cream/[0.05] border border-cream/[0.08] text-[0.88rem] leading-relaxed text-cream/60 self-end max-w-[85%] text-right">
                I've been feeling really lost lately.
              </div>
              <div className="px-5 py-4 bg-gold/[0.07] border border-gold/[0.12] text-cream font-serif text-base leading-relaxed self-start max-w-[85%]">
                That sounds heavy. I'm here with you. Tell me what's been weighing on your heart.
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <MockupCtrl active>&#127908;</MockupCtrl>
              <MockupCtrl>&#9208;</MockupCtrl>
              <MockupCtrl>&#10005;</MockupCtrl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SidebarItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 text-[0.8rem] rounded-sm transition-all ${
        active ? 'bg-gold/[0.12] text-gold' : 'text-cream/30'
      }`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
      {label}
    </div>
  )
}

function MockupCtrl({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`w-11 h-11 rounded-full border flex items-center justify-center text-base transition-all ${
        active
          ? 'bg-gold border-gold text-night'
          : 'border-gold/20 text-cream/30 hover:border-gold hover:text-gold'
      }`}
    >
      {children}
    </div>
  )
}
