export function Divider({ text }: { text: string }) {
  return (
    <div className="reveal flex items-center gap-6 px-8 max-w-[900px] mx-auto">
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }}
      />
      <div
        className="font-display text-[0.6rem] tracking-[0.3em] text-gold uppercase whitespace-nowrap"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div
        className="flex-1 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }}
      />
    </div>
  )
}
