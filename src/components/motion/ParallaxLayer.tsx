import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  /** Negative = moves up faster than scroll (foreground), positive = slower (background) */
  speed?: number;
  scale?: [number, number];
  className?: string;
}

/**
 * Parallax depth layer for hero / image sections.
 * Uses scrollYProgress relative to its own container.
 */
export function ParallaxLayer({
  children,
  speed = -80,
  scale,
  className,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);
  const s = useTransform(
    scrollYProgress,
    [0, 1],
    scale ?? [1, 1]
  );

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ y, scale: scale ? s : undefined, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
