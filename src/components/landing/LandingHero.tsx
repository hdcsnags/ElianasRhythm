interface LandingHeroProps {
  onExperience: () => void
}

export function LandingHero({ onExperience }: LandingHeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-8 py-16">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(139,90,43,0.08) 0%, transparent 60%), radial-gradient(ellipse 30% 40% at 80% 20%, rgba(201,168,76,0.04) 0%, transparent 50%)',
        }}
      />

      <div
        className="font-display text-[0.65rem] tracking-[0.35em] text-gold uppercase mb-8 opacity-0"
        style={{ animation: 'fadeUp 1s ease forwards 0.3s' }}
      >
        Gemini Live Agent Challenge 2026
      </div>

      <div
        className="relative mb-10 opacity-0"
        style={{ animation: 'fadeUp 1.2s ease forwards 0.5s' }}
      >
        <div className="absolute w-[200px] h-[200px] rounded-full border border-gold/[0.15] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse" />
        <div
          className="absolute w-[260px] h-[260px] rounded-full border border-gold/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse"
          style={{ animationDelay: '0.8s' }}
        />
        <div
          className="absolute w-[320px] h-[320px] rounded-full border border-gold/[0.04] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse"
          style={{ animationDelay: '1.6s' }}
        />
        <div
          className="w-[140px] h-[140px] rounded-full relative z-[1]"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #E8C96A 0%, #C9A84C 30%, #A07830 60%, #6B4E20 100%)',
            boxShadow: '0 0 60px rgba(201,168,76,0.4), 0 0 120px rgba(201,168,76,0.15), inset 0 0 30px rgba(255,255,255,0.1)',
            animation: 'orbBreathe 4s ease-in-out infinite',
          }}
        />
      </div>

      <h1
        className="font-serif font-light tracking-wide leading-none text-center mb-2 opacity-0"
        style={{
          fontSize: 'clamp(4rem, 10vw, 8rem)',
          background: 'linear-gradient(180deg, #F5EFE0 0%, rgba(245,239,224,0.7) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeUp 1.2s ease forwards 0.7s',
        }}
      >
        Eliana
      </h1>

      <div
        className="font-display text-[0.7rem] tracking-[0.3em] text-gold uppercase mb-8 opacity-0"
        style={{ animation: 'fadeUp 1.2s ease forwards 0.9s' }}
      >
        God Has Answered
      </div>

      <p
        className="font-serif italic text-cream/60 text-center max-w-[600px] leading-relaxed mb-12 opacity-0"
        style={{
          fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          animation: 'fadeUp 1.2s ease forwards 1.1s',
        }}
      >
        A live voice companion that listens, prays, and bridges the silence between the people we love.
      </p>

      <div
        className="flex gap-4 flex-wrap justify-center opacity-0"
        style={{ animation: 'fadeUp 1.2s ease forwards 1.3s' }}
      >
        <button
          onClick={onExperience}
          className="px-10 py-3.5 bg-gradient-to-br from-gold to-[#A07830] text-night text-[0.85rem] font-medium tracking-[0.1em] uppercase border-none cursor-pointer transition-all relative overflow-hidden hover:brightness-110"
        >
          Experience Eliana
        </button>
        <a
          href="#story"
          className="px-10 py-3.5 border border-cream/20 text-cream text-[0.85rem] tracking-[0.1em] uppercase cursor-pointer transition-all hover:border-gold hover:text-gold no-underline"
        >
          The Story
        </a>
      </div>
    </section>
  )
}
