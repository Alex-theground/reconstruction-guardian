type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 마크
 * - 미니멀 모노그램: 수직 획(원칙) + 금색 hairline(감독의 시선)
 * - 군더더기 없는 기하학적 구성으로 절제된 신뢰감 표현
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
      <line x1="13" y1="8" x2="13" y2="32" stroke={fg} strokeWidth="1.25" />
      <line x1="27" y1="8" x2="27" y2="32" stroke={fg} strokeWidth="1.25" />
      <line x1="13" y1="20" x2="27" y2="20" stroke={accent} strokeWidth="1.25" />
    </svg>
  );
}
