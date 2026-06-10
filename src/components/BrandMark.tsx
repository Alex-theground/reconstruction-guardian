type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 마크 — 세리프 이니셜 B
 * 원형 프레임 안의 클래식 세리프 'B' + 하단 금색 언더라인.
 */
export function BrandMark({ size = 40, variant = "dark", className = "" }: BrandMarkProps) {
  const fg = variant === "dark" ? "var(--ink)" : "var(--parchment)";
  const accent = "var(--gold)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-label="바른집행"
      role="img"
      fill="none"
    >
      <circle cx="20" cy="20" r="18.75" stroke={fg} strokeWidth="0.75" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontSize="20"
        fontWeight="500"
        fill={fg}
        letterSpacing="-0.02em"
      >
        B
      </text>
      <line x1="16" y1="31.5" x2="24" y2="31.5" stroke={accent} strokeWidth="1" />
    </svg>
  );
}
