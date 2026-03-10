const terms = [
  {
    original: '\u1F51\u03C0\u03B5\u03C1\u03B5\u03C0\u03B5\u03C1\u03AF\u03C3\u03C3\u03B5\u03C5\u03C3\u03B5\u03BD',
    name: 'Hyperperisseuo',
    phonetic: 'hoo-per-pe-ris-syoo-en',
    meaning: 'Grace overflows in excess beyond all measure. Where sin costs ten dollars, God has already paid one million.',
    ref: 'Romans 5:20',
  },
  {
    original: '\u05EA\u05B4\u05BC\u05E7\u05B0\u05D5\u05B8\u05D4',
    name: 'Tikvah',
    phonetic: 'tik-VAH',
    meaning: 'Hope — a cord, an anchor. Not a wish. Something that holds you even when you can\'t hold yourself.',
    ref: 'Jeremiah 29:11',
  },
  {
    original: '\u1F00\u03B3\u03AC\u03C0\u03B7',
    name: 'Agape',
    phonetic: 'ah-GAH-pay',
    meaning: 'Not sentiment. Covenant. Love that reaches you at your lowest because of who God is, not who you are.',
    ref: 'Romans 5:8',
  },
  {
    original: '\u03B5\u1F30\u03C1\u03AE\u03BD\u03B7',
    name: 'Eirene',
    phonetic: 'ay-RAY-nay',
    meaning: 'Shalom wearing Greek clothes. Not absence of conflict — wholeness, divine completeness.',
    ref: 'Philippians 4:7',
  },
  {
    original: '\u05E0\u05B4\u05E8\u05B0\u05E4\u05BC\u05B8\u05D0',
    name: 'Nirpa',
    phonetic: 'nir-PAH',
    meaning: 'To heal, restore, make whole — body and spirit together. Complete restoration, not just relief.',
    ref: 'Isaiah 53:5',
  },
  {
    original: '\u03BC\u03BF\u03BD\u03BF\u03B3\u03B5\u03BD\u03AE\u03C2',
    name: 'Monogenes',
    phonetic: 'mo-no-ge-NACE',
    meaning: 'Unique. One-of-a-kind. Wholly unrepeatable. Yeshua\'s relationship with the Father is without category.',
    ref: 'John 3:16',
  },
]

export function LandingTheology() {
  return (
    <section className="bg-deep py-32 px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)' }}
      />
      <div className="max-w-[1100px] mx-auto relative z-[1]">
        <div className="reveal">
          <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
            Depth
            <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
          </div>
          <h2 className="font-serif font-light leading-[1.15] text-cream mb-0" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Scripture in its<br /><em className="italic text-gold-soft">original voice</em>
          </h2>
          <p className="text-[1.05rem] leading-[1.85] text-cream/60 max-w-[680px] mt-8">
            Eliana knows the words behind the translations. Not "abounds more" — but hyperperisseuo. Not just "hope" — but tikvah, a cord anchoring you to God's promises even in exile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gold/10 mt-16 border border-gold/10">
          {terms.map((term, i) => (
            <div
              key={term.name}
              className="reveal bg-deep p-10 transition-colors hover:bg-gold/[0.05]"
              style={{ transitionDelay: `${(i % 3) * 0.1}s` }}
            >
              <div className="font-serif text-[2rem] font-light text-gold mb-1">{term.original}</div>
              <div className="font-display text-[0.65rem] tracking-[0.25em] text-cream/30 uppercase mb-2">{term.name}</div>
              <div className="font-serif italic text-[0.85rem] text-cream/30 mb-4">{term.phonetic}</div>
              <div className="text-[0.9rem] leading-[1.65] text-cream/60">{term.meaning}</div>
              <div className="font-display text-[0.55rem] tracking-[0.2em] text-gold/60 mt-4 uppercase">{term.ref}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
