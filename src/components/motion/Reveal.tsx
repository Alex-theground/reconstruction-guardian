import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  y?: number;
  z?: number;
  duration?: number;
  once?: boolean;
}

/**
 * Scroll-triggered reveal with subtle 3D depth (translateZ + translateY + fade).
 * Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  z = -60,
  duration = 0.8,
  once = true,
  className,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y, z, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, z: 0, rotateX: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200, transformStyle: "preserve-3d" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
