type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 마크
 * - 한글 'ㅂ' 자소를 모티브로 한 기하학적 마크
 * - 좌측 수직 획 = 원칙(곧음), 우측 수직 획 = 집행(실행)
 * - 상단 금색 hairline = 감독의 시선
 * - 하단 가로 획 = 신뢰의 기반
 */
export function BrandMark({ size = 40, variant = "dark", className = "" }: BrandMarkProps) {
  const bg = variant === "dark" ? "var(--ink)" : "var(--parchment)";
  const stroke = variant === "dark" ? "var(--parchment)" : "var(--ink)";
  const accent = "var(--gold)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-label="바른집행 로고"
      role="img"
    >
      <rect width="40" height="40" rx="2" fill={bg} />
      {/* 상단 금색 hairline */}
      <line x1="8" y1="10" x2="32" y2="10" stroke={accent} strokeWidth="1" />
      {/* ㅂ 형상: 좌·우 수직, 하단 수평 */}
      <line x1="12" y1="14" x2="12" y2="30" stroke={stroke} strokeWidth="1.5" strokeLinecap="square" />
      <line x1="28" y1="14" x2="28" y2="30" stroke={stroke} strokeWidth="1.5" strokeLinecap="square" />
      <line x1="11.25" y1="30" x2="28.75" y2="30" stroke={stroke} strokeWidth="1.5" strokeLinecap="square" />
      {/* 중앙 금색 점 = 균형 */}
      <circle cx="20" cy="22" r="1.25" fill={accent} />
    </svg>
  );
}
