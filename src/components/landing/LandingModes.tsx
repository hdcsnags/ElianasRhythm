import { Bird, Globe, GraduationCap } from 'lucide-react'

interface LandingModesProps {
  onExperience: () => void
}

export function LandingModes({ onExperience }: LandingModesProps) {
  return (
    <section className="py-32 px-8 max-w-[1100px] mx-auto">
      <div className="reveal">
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
          Capabilities
          <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
        </div>
        <h2 className="font-serif font-light leading-[1.15] mb-0 text-cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
          Built for the moments<br /><em className="italic text-gold-soft">that matter most</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-6 mt-16">
        <div
          onClick={onExperience}
          className="reveal p-10 border border-gold/25 relative overflow-hidden cursor-pointer transition-all duration-300 hover:border-gold/40 hover:-translate-y-[3px]"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08) 0%, #1A1A2A 100%)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
          <div className="font-display text-[0.55rem] tracking-[0.3em] text-gold uppercase border border-gold px-3 py-1 inline-block mb-6">
            Live
          </div>
          <Bird className="w-7 h-7 text-gold/60 mb-4" />
          <div className="font-serif text-[1.8rem] text-cream mb-3">Companion</div>
          <p className="text-[0.9rem] leading-[1.7] text-cream/30">
            Real-time voice conversation grounded in scripture. Eliana listens, honors silence, prays with you in your own words. For the 2am moments when no one else is there.
          </p>
        </div>

        <div
          className="reveal p-10 bg-surface border border-gold/10 relative overflow-hidden transition-all duration-300 hover:border-gold/30 hover:-translate-y-[3px] cursor-pointer group"
          style={{ transitionDelay: '0.15s' }}
          onClick={onExperience}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="font-display text-[0.55rem] tracking-[0.3em] text-cream/30 uppercase border border-cream/30 px-3 py-1 inline-block mb-6">
            Prototype
          </div>
          <Globe className="w-7 h-7 text-cream/20 mb-4" />
          <div className="font-serif text-[1.8rem] text-cream mb-3">Bridge</div>
          <p className="text-[0.9rem] leading-[1.7] text-cream/30">
            Live bilingual conversation. Farsi &#8596; English. For families separated by language, not by love.
          </p>
        </div>

        <div
          className="reveal p-10 bg-surface border border-gold/[0.05] relative overflow-hidden transition-all duration-300 hover:border-gold/20 hover:-translate-y-[3px] group opacity-60"
          style={{ transitionDelay: '0.3s' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="font-display text-[0.55rem] tracking-[0.3em] text-cream/20 uppercase border border-cream/20 px-3 py-1 inline-block mb-6">
            Soon
          </div>
          <GraduationCap className="w-7 h-7 text-cream/10 mb-4" />
          <div className="font-serif text-[1.8rem] text-cream mb-3">Tutor</div>
          <p className="text-[0.9rem] leading-[1.7] text-cream/30">
            Original language scripture study. Learn hesed, tikvah, agape as living words — not translations.
          </p>
        </div>
      </div>
    </section>
  )
}
