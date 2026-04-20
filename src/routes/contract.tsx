import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { Check } from "lucide-react";

export const Route = createFileRoute("/contract")({
  head: () => ({
    meta: [
      { title: "계약 안내 — 정감 회계" },
      {
        name: "description",
        content: "월정 수수료 기반의 프리랜서 감독 계약 조건과 표준 약정 내용.",
      },
      { property: "og:title", content: "계약 안내 — 정감 회계" },
      {
        property: "og:description",
        content: "조합 규모별 월정 수수료 및 표준 계약 조건.",
      },
    ],
  }),
  component: ContractPage,
});

const tiers = [
  {
    name: "Standard",
    scale: "500세대 미만",
    price: "₩2,500,000",
    unit: "/ 월 (VAT 별도)",
    items: [
      "월간 회계·지출 정기 검토",
      "분기별 종합 보고서",
      "주요 자금집행 사전 검토 (월 3건)",
      "조합총회 의견서 제공",
      "연 1회 조합원 공개 설명회",
    ],
    featured: false,
  },
  {
    name: "Premium",
    scale: "500 ~ 1,500세대",
    price: "₩4,500,000",
    unit: "/ 월 (VAT 별도)",
    items: [
      "Standard 전체 항목 포함",
      "주요 자금집행 사전 검토 (무제한)",
      "월 1회 현장 방문 회의",
      "협력업체 계약 단가 시장 비교 분석",
      "긴급 사안 24시간 검토",
      "조합원 분담금 시뮬레이션",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    scale: "1,500세대 이상",
    price: "협의",
    unit: "맞춤 설계",
    items: [
      "Premium 전체 항목 포함",
      "전담 회계사 배정 (주 1회 상주)",
      "조합 직원 회계 교육 제공",
      "외부 회계감사 대응 지원",
      "준공 후 청산 회계까지 연속 수행",
    ],
    featured: false,
  },
];

const terms = [
  ["계약 형태", "프리랜서 용역 계약 (조합과 개인 회계사 간 직접 체결)"],
  ["계약 기간", "기본 1년, 자동 연장. 사업 종료 시까지 연속 가능"],
  ["보수 지급", "매월 말일 일괄 지급, 세금계산서 발행"],
  ["독립성", "조합과 어떠한 지분·이해관계도 없는 외부 회계사로서 수행"],
  ["비밀 유지", "계약 종료 후에도 5년간 조합 정보 비공개 유지 의무"],
  ["해지 조건", "양 당사자 모두 30일 사전 통보로 해지 가능"],
];

function ContractPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Contract"
        title="합리적인 월정 수수료, 명확한 계약."
        description="조합 규모에 맞는 표준 요금제와 함께, 프리랜서 용역 계약 형태로 독립성과 책임성을 모두 확보합니다."
      />

      {/* Pricing */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col p-10 ${
                  t.featured ? "bg-ink text-primary-foreground" : "bg-card"
                }`}
              >
                <div className={`text-xs uppercase tracking-[0.25em] ${t.featured ? "text-gold" : "text-gold"}`}>
                  {t.name}
                </div>
                <div className={`mt-4 font-serif text-2xl ${t.featured ? "text-primary-foreground" : "text-foreground"}`}>
                  {t.scale}
                </div>
                <div className="mt-8">
                  <div className={`font-serif text-5xl ${t.featured ? "text-gold" : "text-foreground"}`}>
                    {t.price}
                  </div>
                  <div className={`mt-2 text-sm ${t.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {t.unit}
                  </div>
                </div>
                <ul className={`mt-10 space-y-4 border-t pt-8 ${t.featured ? "border-primary-foreground/15" : "border-border"}`}>
                  {t.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm">
                      <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${t.featured ? "text-gold" : "text-gold"}`} />
                      <span className={t.featured ? "text-primary-foreground/85" : "text-foreground/80"}>{it}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className={`mt-10 inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm font-medium transition-all ${
                    t.featured
                      ? "bg-gold text-ink hover:opacity-90"
                      : "border border-foreground/20 hover:bg-foreground/5"
                  }`}
                >
                  상담 신청
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            * 위 요금은 표준 안내가이며, 사업 단계(조합설립·시공자선정·관리처분·착공·준공)에 따라 조정될 수 있습니다.
          </p>
        </div>
      </section>

      {/* Terms */}
      <section className="border-t border-border bg-parchment py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">표준 계약 조건</div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">계약의 핵심 조항</h2>

          <dl className="mt-16 divide-y divide-border border-y border-border">
            {terms.map(([k, v]) => (
              <div key={k} className="grid gap-4 py-6 md:grid-cols-12 md:gap-8">
                <dt className="font-serif text-lg text-foreground md:col-span-3">{k}</dt>
                <dd className="text-foreground/75 md:col-span-9">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PageShell>
  );
}
