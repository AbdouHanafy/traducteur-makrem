export default function PublicPageHero({ eyebrow, title, description, narrow = false, children }: {
  eyebrow: string;
  title: string;
  description?: string;
  narrow?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(145deg,#0b1830_0%,#14284d_68%,#1a376b_100%)] py-14 text-white sm:py-18">
      <div className="pointer-events-none absolute -right-28 -top-40 h-96 w-96 rounded-full border-[65px] border-white/[0.035]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-[12%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#b4894e]/40 to-transparent" aria-hidden="true" />
      <div className={`relative mx-auto px-4 sm:px-6 lg:px-8 ${narrow ? "max-w-[880px]" : "max-w-[1200px]"}`}>
        {children}
        <p className="mb-3 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[.19em] text-[#8fb4ff]"><span className="h-px w-6 bg-[#8fb4ff]" />{eyebrow}</p>
        <h1 className="max-w-[25ch] text-[clamp(30px,4vw,46px)] text-white">{title}</h1>
        {description && <p className="mt-4 max-w-[65ch] text-[15px] leading-7 text-slate-300 sm:text-[16px]">{description}</p>}
      </div>
    </section>
  );
}
