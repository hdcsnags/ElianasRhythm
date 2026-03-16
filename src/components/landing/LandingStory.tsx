export function LandingStory() {
  return (
    <section className="py-32 px-8 max-w-[1100px] mx-auto" id="story">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="reveal">
          <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-4">
            Origin
            <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
          </div>
          <h2 className="font-serif font-light leading-[1.15] mb-8 text-cream" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
            Born from a<br /><em className="italic text-gold-soft">father's prayer</em>
          </h2>
          <div className="text-[1.05rem] leading-[1.85] text-cream/60 max-w-[680px] space-y-5">
            <p>
              My daughter Mikaylah Aliyah Eliana entered the world after 459 contractions and an emergency C-section. She arrived with a giggle before her first cry, because a nurse refused to give up.
            </p>
            <p>
              Her name means <em className="text-cream/80">"God has answered."</em> I wrote a book for her — <em className="text-cream/80">Eliana's Journal</em> — so that whenever she gets lonely, my words would remain with her always.
            </p>
            <p>
              That book became the soul of this app. The theology is real. The grace is radical. The companion is built for the moments when no one else is there.
            </p>
          </div>
        </div>
        <div className="reveal" style={{ transitionDelay: '0.2s' }}>
          <div className="pull-quote border-l-2 border-gold pl-8">
            <div className="font-serif italic text-cream" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', lineHeight: '1.5' }}>
              Before they call I will answer; while they are still speaking I will hear.
            </div>
            <div className="font-serif text-cream/60 text-[1.3rem] mt-6 not-italic" dir="rtl">
              בְּטֶרֶם יִקְרָאוּ וַאֲנִי אֶעֱנֶה
            </div>
            <p className="text-[0.85rem] text-cream/40 mt-2 not-italic italic">
              b'terem yikre'u va'ani e'eneh
            </p>
            <div className="font-display text-[0.6rem] tracking-[0.2em] text-gold mt-6 not-italic uppercase">
              Isaiah 65:24
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
