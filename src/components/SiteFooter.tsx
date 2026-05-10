import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-gold text-ink font-serif text-lg">
                正
              </div>
              <div>
                <div className="font-serif text-lg">정감 회계</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60">
                  Union Audit Partners
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/70">
              재건축·재개발 조합의 회계 투명성과 자금 집행의 적정성을 독립적인 회계사의
              관점에서 검증합니다. 조합원의 자산을 지키는 마지막 방어선이 되겠습니다.
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

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-primary-foreground/10 pt-8 text-xs text-primary-foreground/50 md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} 정감 회계.</span>
          <div className="flex items-center gap-4">
            <span>본 사이트는 서비스 제안을 위한 안내용입니다.</span>
            <Link to="/admin" className="text-primary-foreground/40 hover:text-gold">관리자</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
