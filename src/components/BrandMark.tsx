type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 마크 — 정사각 세리프 이니셜 B
 * - 솔리드 정사각 프레임 (ink/parchment)
 * - 클래식 세리프 'B' 이니셜
 * - 좌측 금색 수직 액센트(감독의 시선)
 */
export function BrandMark({ size = 40, variant = "dark", className = "" }: BrandMarkProps) {
  const isDark = variant === "dark";
  const bg = isDark ? "var(--ink)" : "var(--parchment)";
  const fg = isDark ? "var(--parchment)" : "var(--ink)";
  const accent = "var(--gold)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-label="바른집행"
      role="img"
    >
      <rect width="40" height="40" fill={bg} />
      {/* 좌측 금색 수직 액센트 */}
      <line x1="6" y1="8" x2="6" y2="32" stroke={accent} strokeWidth="1" />
      {/* 세리프 이니셜 B */}
      <text
        x="22"
        y="27.5"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="22"
        fontWeight="500"
        fill={fg}
        letterSpacing="-0.02em"
      >
        B
      </text>
    </svg>
  );
}
