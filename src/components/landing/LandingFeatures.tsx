const features = [
  {
    num: '01',
    title: 'The Holy Pause',
    desc: "Eliana is comfortable with 3-4 seconds of silence. She doesn't rush to fill it. Silence is where people find their next true word.",
  },
  {
    num: '02',
    title: 'Live Multimodal',
    desc: 'Powered by Gemini Live API — real-time bidirectional audio with vision context. She sees, she hears, she responds without delay.',
  },
  {
    num: '03',
    title: 'Scripture Grounding',
    desc: 'Every response is explainable. Original Greek and Hebrew terms surface with phonetics, meaning, and theological context. No hallucinated verses.',
  },
  {
    num: '04',
    title: 'Presence Over Product',
    desc: "She doesn't say \"How can I help you today?\" She says \"I'm here.\" She asks before interpreting. She prays in your words, not a template.",
  },
]

export function LandingFeatures() {
  return (
    <section className="py-32 px-8 max-w-[1100px] mx-auto">
      <div className="reveal">
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
          Architecture
          <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
        </div>
        <h2 className="font-serif font-light leading-[1.15] text-cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
          Built different,<br /><em className="italic text-gold-soft">by design</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
        {features.map((f, i) => (
          <div key={f.num} className="reveal flex gap-6" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="font-serif text-[3rem] font-light text-gold/20 leading-none shrink-0 w-10">
              {f.num}
            </div>
            <div>
              <div className="font-serif text-[1.3rem] text-cream mb-2">{f.title}</div>
              <div className="text-[0.88rem] leading-[1.7] text-cream/30">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
