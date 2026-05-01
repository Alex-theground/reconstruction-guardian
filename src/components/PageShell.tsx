import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-border bg-parchment">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</div>
        <h1 className="mt-6 max-w-3xl font-serif text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <div className="hairline mt-8 w-24" />
        {description && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/75 md:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
