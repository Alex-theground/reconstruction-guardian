import lockupAsset from "@/assets/brand-lockup.png.asset.json";

type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 로고 락업 (심볼 + 워드마크)
 */
export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <img
      src={lockupAsset.url}
      alt="바른집행 — 조합 지출 검토 전문 컨설팅"
      height={size}
      className={className}
      style={{ height: size, width: "auto", objectFit: "contain" }}
    />
  );
}
