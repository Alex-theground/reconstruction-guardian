import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef } from "react";

interface CountUpProps {
  /** End value (number). For values like "62%" pass 62 and suffix="%". */
  to: number;
  from?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

/**
 * Animated number counter that triggers when scrolled into view.
 * Pairs nicely with a 3D rotateX flip on entry for a "flip-display" feel.
 */
export function CountUp({
  to,
  from = 0,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();

  const mv = useMotionValue(from);
  const spring = useSpring(mv, {
    duration: duration * 1000,
    bounce: 0,
  });
  const display = useTransform(spring, (latest) =>
    `${prefix}${latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${suffix}`
  );

  useEffect(() => {
    if (inView) mv.set(reduce ? to : to);
  }, [inView, to, mv, reduce]);

  return (
    <motion.span
      ref={ref}
      initial={reduce ? false : { rotateX: -90, opacity: 0 }}
      animate={inView ? { rotateX: 0, opacity: 1 } : undefined}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "inline-block",
        transformPerspective: 800,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50% -20px",
      }}
      className={className}
    >
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
