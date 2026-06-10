type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
  /** 1: 미니멀 라인, 2: 세리프 이니셜, 3: 도장 스타일 */
  design?: 1 | 2 | 3;
};

/**
 * 바른집행 CI 마크 — 3가지 시안
 */
export function BrandMark({
  size = 40,
  variant = "dark",
  className = "",
  design = 1,
}: BrandMarkProps) {
  const fg = variant === "dark" ? "var(--ink)" : "var(--parchment)";
  const accent = "var(--gold)";
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 40 40",
    className,
    "aria-label": "바른집행",
    role: "img" as const,
    fill: "none" as const,
  };

  // 시안 1: 미니멀 라인 — 가는 수직선 두 개와 금색 hairline
  if (design === 1) {
    return (
      <svg {...common}>
        <line x1="14" y1="9" x2="14" y2="31" stroke={fg} strokeWidth="1" />
        <line x1="26" y1="9" x2="26" y2="31" stroke={fg} strokeWidth="1" />
        <line x1="14" y1="20" x2="26" y2="20" stroke={accent} strokeWidth="1" />
      </svg>
    );
  }

  // 시안 2: 세리프 이니셜 'B' — 워드마크와 어울리는 클래식 모노그램
  if (design === 2) {
    return (
      <svg {...common}>
        <circle cx="20" cy="20" r="18.5" stroke={fg} strokeWidth="0.75" />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fontFamily="var(--font-serif)"
          fontSize="20"
          fontWeight="500"
          fill={fg}
          letterSpacing="-0.02em"
        >
          B
        </text>
        <line x1="16" y1="32" x2="24" y2="32" stroke={accent} strokeWidth="1" />
      </svg>
    );
  }

  // 시안 3: 도장(印) 스타일 — 정사각 프레임 + 한자 '正'의 기하학적 추상
  return (
    <svg {...common}>
      <rect x="2" y="2" width="36" height="36" stroke={fg} strokeWidth="1" />
      <line x1="10" y1="13" x2="30" y2="13" stroke={fg} strokeWidth="1.25" />
      <line x1="20" y1="13" x2="20" y2="30" stroke={fg} strokeWidth="1.25" />
      <line x1="13" y1="20" x2="27" y2="20" stroke={fg} strokeWidth="1.25" />
      <line x1="10" y1="30" x2="30" y2="30" stroke={accent} strokeWidth="1.25" />
    </svg>
  );
}
