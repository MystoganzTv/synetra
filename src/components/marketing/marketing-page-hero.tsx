interface MarketingPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function MarketingPageHero({
  eyebrow,
  title,
  description,
}: MarketingPageHeroProps) {
  return (
    <section className="rounded-[34px] border border-white/80 bg-white/78 px-6 py-8 shadow-[0_20px_50px_-32px_rgba(18,27,79,0.2)] backdrop-blur sm:px-8 sm:py-10">
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

