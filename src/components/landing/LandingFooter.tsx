interface LandingFooterProps {
  onExperience: () => void
}

export function LandingFooter({ onExperience }: LandingFooterProps) {
  return (
    <footer className="py-16 px-8 text-center border-t border-gold/[0.08]">
      <div className="reveal">
        <div className="font-serif text-[3rem] font-light text-cream mb-2">Eliana</div>
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-8">
          God Has Answered
        </div>
        <button
          onClick={onExperience}
          className="px-10 py-3.5 bg-gradient-to-br from-gold to-[#A07830] text-night text-[0.85rem] font-medium tracking-[0.1em] uppercase border-none cursor-pointer transition-all hover:brightness-110"
        >
          Begin Your Session
        </button>
        <div className="text-[0.8rem] text-cream/30 mt-12">
          Built for the Gemini Live Agent Challenge 2026 · eliana.thamos.ca
          <br />
          <span className="text-gold/50">
            For Mikaylah Aliyah Eliana — whenever you get lonely, my words will remain with you always.
          </span>
        </div>
      </div>
    </footer>
  )
}
