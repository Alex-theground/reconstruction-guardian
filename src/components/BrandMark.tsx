import logoAsset from "@/assets/brand-logo.png.asset.json";

type BrandMarkProps = {
  size?: number;
  variant?: "dark" | "light";
  className?: string;
};

/**
 * 바른집행 CI 마크 — 공식 로고 이미지
 */
export function BrandMark({ size = 40, className = "" }: BrandMarkProps) {
  return (
    <img
      src={logoAsset.url}
      alt="바른집행"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
