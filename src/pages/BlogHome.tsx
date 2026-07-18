export default function BlogHome() {
  return (
    <div className="flex-1 flex flex-col w-full">

      {/* ── Hero Banner ── Full-bleed, high contrast editorial splash */}
      <section className="w-full bg-zinc-950 dark:bg-zinc-950 py-24 sm:py-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-6">
          {/* Category Label */}
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-brand border border-brand px-3 py-1 rounded-sm">
            Music · Entertainment · News
          </span>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.9] max-w-4xl">
            The Pulse of African Music Culture
          </h1>

          {/* Sub-text */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            DJ Davisy's editorial home — blazing-fast reviews, exclusive drops,
            and entertainment news straight from the deck.
          </p>

          {/* CTA Row */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <a
              href="/category/music"
              className="inline-flex items-center gap-2 bg-brand text-white font-bold uppercase tracking-wider text-xs px-6 py-3 hover:bg-orange-400 transition-colors"
            >
              Explore Music
            </a>
            <a
              href="/category/reviews"
              className="inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 font-bold uppercase tracking-wider text-xs px-6 py-3 hover:border-white hover:text-white transition-colors"
            >
              Latest Reviews
            </a>
          </div>
        </div>
      </section>

      {/* ── Orange accent rule ── brand divider */}
      <div className="w-full h-1 bg-brand" />

      {/* ── Content Grid Area ── Coming soon / placeholder */}
      <section className="w-full bg-background py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
            <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
              Latest Posts
            </h2>
            <a
              href="/category/music"
              className="text-xs font-bold uppercase tracking-widest text-brand hover:underline"
            >
              View All →
            </a>
          </div>

          {/* Empty State — will be replaced by real post cards in Step 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="group flex flex-col gap-3 cursor-pointer"
              >
                {/* Thumbnail skeleton */}
                <div className="w-full aspect-[16/9] bg-muted rounded-sm overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-brand text-white px-2 py-0.5 rounded-sm">
                    Music
                  </span>
                </div>
                {/* Meta */}
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Jul 18, 2026
                  </p>
                  <h3 className="text-sm font-black uppercase tracking-tight text-foreground group-hover:text-brand transition-colors leading-snug">
                    Post headline coming soon — editorial content drops here
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
