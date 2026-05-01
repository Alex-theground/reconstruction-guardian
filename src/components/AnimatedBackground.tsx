import { useEffect, useRef } from "react";

/**
 * 3D-feel animated background.
 * - Three large gradient blobs that drift continuously.
 * - Mouse movement parallaxes the blobs.
 * - Scroll position warps depth (translateZ-like scale & rotateX).
 * Fixed, pointer-events-none, sits behind all content.
 */
export function AnimatedBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });
  const scrollY = useRef(0);
  const targetScroll = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      target.current.x = e.clientX / window.innerWidth;
      target.current.y = e.clientY / window.innerHeight;
    };
    const onScroll = () => {
      targetScroll.current = window.scrollY;
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    const tick = () => {
      // smooth interpolation
      mouse.current.x += (target.current.x - mouse.current.x) * 0.06;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.06;
      scrollY.current += (targetScroll.current - scrollY.current) * 0.08;

      const el = rootRef.current;
      if (el) {
        const mx = (mouse.current.x - 0.5) * 2; // -1..1
        const my = (mouse.current.y - 0.5) * 2;
        const s = scrollY.current;

        el.style.setProperty("--mx", mx.toFixed(3));
        el.style.setProperty("--my", my.toFixed(3));
        el.style.setProperty("--sy", s.toFixed(1));
        el.style.setProperty("--rotX", `${(-my * 6).toFixed(2)}deg`);
        el.style.setProperty("--rotY", `${(mx * 8).toFixed(2)}deg`);
        el.style.setProperty("--depth", `${(s * 0.05).toFixed(2)}px`);
      }

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        perspective: "1200px",
        // initial CSS variables
        ["--mx" as string]: "0",
        ["--my" as string]: "0",
        ["--sy" as string]: "0",
        ["--rotX" as string]: "0deg",
        ["--rotY" as string]: "0deg",
        ["--depth" as string]: "0px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform:
            "rotateX(var(--rotX)) rotateY(var(--rotY)) translateZ(var(--depth))",
          transition: "transform 0.1s linear",
        }}
      >
        {/* Blob 1 — gold */}
        <div
          className="absolute rounded-full blur-3xl opacity-60 animate-blob-1"
          style={{
            width: "55vmax",
            height: "55vmax",
            top: "-15vmax",
            left: "-10vmax",
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.78 0.13 80 / 0.55), transparent 65%)",
            transform:
              "translate3d(calc(var(--mx) * 40px), calc(var(--my) * 40px - var(--sy) * 0.15px), 0)",
          }}
        />
        {/* Blob 2 — ink/navy */}
        <div
          className="absolute rounded-full blur-3xl opacity-50 animate-blob-2"
          style={{
            width: "50vmax",
            height: "50vmax",
            bottom: "-15vmax",
            right: "-10vmax",
            background:
              "radial-gradient(circle at 60% 60%, oklch(0.32 0.06 250 / 0.45), transparent 65%)",
            transform:
              "translate3d(calc(var(--mx) * -50px), calc(var(--my) * -30px + var(--sy) * 0.2px), 0)",
          }}
        />
        {/* Blob 3 — parchment warm */}
        <div
          className="absolute rounded-full blur-3xl opacity-40 animate-blob-3"
          style={{
            width: "45vmax",
            height: "45vmax",
            top: "30%",
            left: "30%",
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.85 0.08 70 / 0.45), transparent 70%)",
            transform:
              "translate3d(calc(var(--mx) * 25px), calc(var(--my) * 25px - var(--sy) * 0.1px), 0)",
          }}
        />
        {/* subtle grid for depth */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.18 0.03 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.18 0.03 250) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform:
              "translate3d(calc(var(--mx) * -15px), calc(var(--my) * -15px), 0)",
          }}
        />
      </div>
    </div>
  );
}
