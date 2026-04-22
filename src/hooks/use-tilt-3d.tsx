import { useCallback, useRef, useState } from "react";

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

export function useTilt3D(maxTilt = 12, scaleFactor = 1.03) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<TiltState>({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * maxTilt;
      const rotateY = (x - 0.5) * maxTilt;
      setStyle({ rotateX, rotateY, scale: scaleFactor });
    },
    [maxTilt, scaleFactor]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const tiltStyle: React.CSSProperties = {
    transform: `perspective(800px) rotateX(${style.rotateX}deg) rotateY(${style.rotateY}deg) scale3d(${style.scale}, ${style.scale}, ${style.scale})`,
    transition: "transform 0.15s ease-out",
    transformStyle: "preserve-3d" as const,
  };

  return {
    ref,
    tiltStyle,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
