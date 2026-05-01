import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { AnimatedBackground } from "./AnimatedBackground";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <AnimatedBackground />
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
        <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.1] text-foreground md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
