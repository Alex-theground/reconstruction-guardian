import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { CheckCircle2 } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "서비스 — 정감 회계" },
      {
        name: "description",
        content:
          "조합 회계·지출 검토와 조합 운영 자금집행 검증, 두 가지 핵심 감독 서비스의 상세 내역.",
      },
      { property: "og:title", content: "서비스 — 정감 회계" },
      { property: "og:description", content: "조합 회계 감독 서비스의 모든 항목." },
    ],
  }),
  component: ServicesPage,
});

interface ServiceItem { num: string; title: string; summary: string; items: string[] }
interface ServicesData {
  services: ServiceItem[];
  transparencyTitle: string;
  transparencyDescription: string;
}

const defaultServices: ServiceItem[] = [
  {
    num: "01",
    title: "조합 회계 및 지출에 대한 세부 검토 · 적정성 검증",
    summary:
      "조합의 회계 처리와 모든 지출 항목에 대해 독립 회계사의 관점에서 적정성을 정기적으로 검증합니다.",
    items: [
      "월별 지출 내역 전수 검토 및 증빙서류 대조",
      "시공사·정비업체·설계사 등 협력업체 계약 단가의 적정성 분석",
      "회계장부와 통장 거래내역의 정합성 점검",
      "예비비·운영비 사용처의 합리성 평가",
      "이중 지급 및 가공 거래 여부 검토",
      "분기별 회계 검토 보고서 발행",
    ],
  },
  {
    num: "02",
    title: "조합 운영 및 자금집행에 대한 세무적 타당성 검증",
    summary:
      "조합 집행부의 의사결정과 자금집행 전반에 대한 세무·법무적 리스크를 사전·사후로 검증하여, 사업 추진의 안정성과 투명성을 함께 확보합니다.",
    items: [
      "주요 자금집행 결정 사전 검토 의견서 제공",
      "법인세·부가세·원천세 등 세무 신고의 적정성 확인",
      "조합원 분담금·환급금 산정 방식 검증",
      "조합 업무추진비·인건비 등 운영비 집행 내역 점검",
      "세무조사 리스크 사전 진단",
      "조합총회 안건에 대한 회계·세무적 의견 제시",
    ],
  },
];

const defaultTransparencyTitle = "모든 검증 결과는 조합원에게도 투명하게 공유됩니다.";
const defaultTransparencyDescription =
  "정기 보고서는 조합 집행부뿐 아니라 요청 시 조합원 대표회의에도 직접 제출됩니다. 이는 단순한 컨설팅이 아닌, 조합원 전체를 위한 공적 감독 역할을 수행한다는 의미입니다.";

function ServicesPage() {
  const { content, loading } = useSiteContent<ServicesData>("services");

  const services = content?.services && content.services.length > 0 ? content.services : defaultServices;
  const transparencyTitle = content?.transparencyTitle || defaultTransparencyTitle;
  const transparencyDescription = content?.transparencyDescription || defaultTransparencyDescription;

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">로딩 중...</div>
      </PageShell>
    );
  }

  // Highlight gold on "조합원에게도" if present in title
  const renderTitle = (title: string) => {
    const goldKeyword = "조합원에게도";
    if (title.includes(goldKeyword)) {
      const [before, after] = title.split(goldKeyword);
      return (
        <>
          {before}
          <span className="text-gold">{goldKeyword}</span>
          {after}
        </>
      );
    }
    return title;
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Services"
        title="두 개의 축으로 조합을 지킵니다."
        description="회계의 정확성과 자금집행의 타당성. 이 두 가지가 흔들리면 조합 전체가 흔들립니다. 정감 회계는 두 영역 모두에 독립적이고 지속적인 감독을 제공합니다."
      />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 space-y-32">
          {services.map((s, i) => (
            <article key={s.num + i} className="grid gap-16 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="font-serif text-7xl text-gold">{s.num}</div>
                <div className="mt-6 hairline w-24" />
                <p className="mt-6 text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  {i === 0 ? "Accounting Audit" : i === 1 ? "Executive Oversight" : "Service"}
                </p>
              </div>
              <div className="md:col-span-8">
                <h2 className="font-serif text-3xl leading-tight md:text-4xl">{s.title}</h2>
                <p className="mt-6 text-lg leading-relaxed text-foreground/70">{s.summary}</p>
                <ul className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
                  {s.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                      <span className="text-sm leading-relaxed text-foreground/85">{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <h3 className="font-serif text-3xl leading-tight md:text-4xl">
              {renderTitle(transparencyTitle)}
            </h3>
            <p className="text-primary-foreground/75 leading-relaxed">
              {transparencyDescription}
            </p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
