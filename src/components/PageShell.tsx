import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Reveal } from "./motion/Reveal";
import { ParallaxLayer } from "./motion/ParallaxLayer";

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
    <section className="relative overflow-hidden border-b border-border bg-parchment perspective-1200">
      {/* Subtle parallax accent — gold radial */}
      <ParallaxLayer speed={60} className="pointer-events-none absolute inset-0">
        <div
          className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 60%)" }}
        />
        <div
          className="absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--ink) 0%, transparent 60%)" }}
        />
      </ParallaxLayer>
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32 preserve-3d">
        <Reveal y={20} z={0}>
          <div className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</div>
        </Reveal>
        <Reveal y={50} z={-90} delay={0.15} duration={0.9}>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.1] text-foreground md:text-6xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal y={30} z={-50} delay={0.35}>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
