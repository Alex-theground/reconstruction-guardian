import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/hooks/use-site-content";
import { mergeHomeExt, type HomeExtData } from "@/lib/home-content";
import { BrandMark } from "./BrandMark";

export function SiteFooter() {
  const { content } = useSiteContent<Partial<HomeExtData>>("home");
  const ext = mergeHomeExt(content);
  const trustItems = ext.trustPrinciples.items;

  return (
    <footer className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <BrandMark size={40} variant="light" />
              <div>
                <div className="font-serif text-lg tracking-tight">바른집행</div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-primary-foreground/60">
                  Right Execution Partners
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              {ext.terminology.footerDescription}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm text-gold">서비스</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/services">회계 검토</Link></li>
              <li><Link to="/services">자금집행 검증</Link></li>
              <li><Link to="/process">감독 프로세스</Link></li>
              <li><Link to="/contract">계약 조건</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm text-gold">문의</h4>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
              <li>info@junggam.kr</li>
              <li>02-0000-0000</li>
              <li>서울특별시 강남구</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-primary-foreground/10 pt-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.25em] text-gold/80">
            {trustItems.map((item, i) => (
              <span key={item.title} className="flex items-center gap-x-6">
                {i > 0 && <span className="text-primary-foreground/20">·</span>}
                <span>{item.title}</span>
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-primary-foreground/55">
            바른집행은 어떠한 시공사·정비업체·협력업체와도 이해관계를 맺지 않으며,
            오직 조합과 조합원의 이익을 기준으로 독립적인 의견을 제시합니다.
            모든 검토 자료와 의사소통 내용은 비밀유지 약정에 따라 보호됩니다.
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-primary-foreground/50 md:flex-row md:items-center">
            <span>© {new Date().getFullYear()} 바른집행.</span>
            <div className="flex items-center gap-4">
              <span>본 사이트는 서비스 제안을 위한 안내용입니다.</span>
              <Link to="/admin" className="text-primary-foreground/40 hover:text-gold">관리자</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
