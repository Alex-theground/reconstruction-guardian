import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ReceiptText, Landmark, FileSearch, ClipboardCheck, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import apartmentImage from "@/assets/apartment-complex.jpg";

export const Route = createFileRoute("/apartment-audit")({
  head: () => ({
    meta: [
      { title: "아파트감사 — 관리비·장기수선충당금 점검 | 바른집행" },
      { name: "description", content: "입주자대표회의와 관리사무소를 위한 아파트 관리비, 장기수선충당금, 공사·용역 계약 및 지출 증빙의 독립적 검토. 업무 범위와 보고 절차를 안내합니다." },
      { property: "og:title", content: "아파트감사 — 바른집행" },
      { property: "og:description", content: "입주민의 관리비와 공동 자산을 위한 독립적인 검토. 관리비·충당금·계약·지출 증빙을 함께 점검합니다." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApartmentAuditPage,
});

const areas = [
  { icon: ReceiptText, number: "01", title: "관리비 및 회계 내역", description: "입주민이 낸 관리비가 어떤 근거로 부과되고, 어디에 사용되었는지 확인합니다.", items: ["관리비 부과 내역과 지출 증빙 대조", "회계장부와 계좌 거래내역의 정합성 점검", "인건비·운영비·공용 관리비의 집행 근거 확인", "중복 지급·증빙 누락·미정산 내역 점검"] },
  { icon: Landmark, number: "02", title: "장기수선충당금", description: "공동 자산의 유지·보수를 위해 적립한 자금이 계획과 절차에 맞게 관리되는지 살펴봅니다.", items: ["충당금 적립·보관·사용 내역 대조", "장기수선계획과 사용 항목의 일치 여부 확인", "사용 승인·의결 및 지출 증빙 점검", "장부상 잔액과 계좌 잔액 대조"] },
  { icon: FileSearch, number: "03", title: "공사·용역 계약 및 지출", description: "계약부터 대금 지급까지 이어지는 자료를 연결해, 지출의 근거와 절차를 검토합니다.", items: ["계약서·견적서·선정 절차 관련 자료 검토", "의결 내용과 실제 계약 조건의 일치 여부 확인", "계약금·중도금·잔금 지급 근거 점검", "계약 변경·추가 지출의 승인 및 증빙 확인"] },
  { icon: ClipboardCheck, number: "04", title: "관리 운영 및 내부 통제", description: "누군가를 지목하기보다, 반복되는 누락과 오류를 줄이는 운영 절차를 함께 점검합니다.", items: ["입주자대표회의 의결과 집행 내역 대조", "지출 승인·자료 보관 절차 점검", "이전 검토 지적 사항의 개선 여부 확인", "확인된 사항과 추가 확인 필요 사항 구분"] },
];

const steps = [
  { title: "범위 협의", description: "단지 현황, 검토 목적, 대상 기간과 항목을 확인하고 자료 접근·보고 범위를 정합니다." },
  { title: "자료 수집", description: "장부, 계좌 내역, 지출 증빙, 계약서, 회의록 및 장기수선 관련 자료를 수집합니다." },
  { title: "대조 및 소명", description: "자료 간 차이와 누락을 확인하고 관리주체의 설명과 추가 증빙을 함께 검토합니다." },
  { title: "결과 보고", description: "확인 근거, 미확인 사항, 개선 제안을 보고서로 정리하고 합의한 대상에게 설명합니다." },
];

function ApartmentAuditPage() {
  return (
    <PageShell>
      <section className="relative isolate overflow-hidden">
        <img src={apartmentImage} alt="공동 정원과 주거동이 있는 아파트 단지 이미지" width={1536} height={1024} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-hero" />
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <p className="text-sm text-gold">바른집행 · 공동주택 관리 검토</p>
          <h1 className="mt-5 font-serif text-5xl leading-tight tracking-normal text-primary-foreground md:text-6xl">아파트감사</h1>
          <p className="mt-6 max-w-2xl text-2xl leading-relaxed text-primary-foreground">입주민의 관리비와 공동 자산,<br />근거와 절차로 확인합니다.</p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">재건축·재개발 조합 감독과 별도로, 이미 입주한 아파트의 관리비·장기수선충당금·계약 및 지출을 독립적인 관점에서 검토합니다.</p>
          <Button asChild size="lg" className="mt-8 h-12 bg-gold text-gold-foreground hover:bg-gold/90">
            <Link to="/contact">아파트감사 상담 신청 <ArrowRight /></Link>
          </Button>
        </div>
      </section>

      <section className="border-b border-border bg-parchment">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-3">
          {[
            ["입주자대표회의", "예산·결산과 주요 지출의 근거를 확인하고 싶은 경우"],
            ["관리사무소·관리주체", "회계자료와 집행 절차를 점검하고 개선하고 싶은 경우"],
            ["입주민", "관리비 사용과 공동 자산 관리에 대한 설명이 필요한 경우"],
          ].map(([title, description]) => <div key={title}><h2 className="text-lg tracking-normal">{title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-sm text-gold">검토 업무</p>
        <h2 className="mt-3 text-3xl leading-tight tracking-normal md:text-4xl">숫자뿐 아니라 지출의 근거까지.</h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">관리비가 올바르게 기록되어 있는지와 함께, 지출이 승인된 목적에 맞는지, 증빙과 실제 지급이 일치하는지를 살펴봅니다. 최종 검토 항목은 계약 시 확정합니다.</p>
        <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {areas.map((area) => <article key={area.number} className="border-t border-border pt-7">
            <div className="flex items-center justify-between"><span className="font-serif text-2xl text-gold">{area.number}</span><area.icon className="h-6 w-6 text-gold" strokeWidth={1.5} /></div>
            <h3 className="mt-4 text-2xl tracking-normal">{area.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{area.description}</p>
            <ul className="mt-6 space-y-3">{area.items.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-relaxed"><Check className="mt-1 h-4 w-4 shrink-0 text-gold" /><span>{item}</span></li>)}</ul>
          </article>)}
        </div>
      </section>

      <section className="bg-parchment py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm text-gold">진행 절차</p>
          <h2 className="mt-3 text-3xl tracking-normal">자료 확인부터 설명 가능한 보고까지.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">{steps.map((step, index) => <li key={step.title} className="border-t border-border pt-5"><span className="text-sm text-gold">0{index + 1}</span><h3 className="mt-3 text-xl tracking-normal">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p></li>)}</ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div><p className="text-sm text-gold">결과 및 공유</p><h2 className="mt-3 text-3xl tracking-normal">확인한 사실을,<br />근거와 함께 남깁니다.</h2><p className="mt-5 leading-relaxed text-muted-foreground">보고서에는 검토 범위와 대상 기간, 확인된 사항, 소명 내용, 추가 확인이 필요한 항목과 개선 제안을 구분해 담습니다. 입주민 공개 여부와 범위는 개인정보·계약상 비밀유지 의무 및 관련 규정을 고려해 협의합니다.</p></div>
        <div className="border-l-2 border-gold pl-6"><h3 className="text-xl tracking-normal">계약 전 확인할 사항</h3><ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground"><li>이 페이지는 관리 운영·지출 검토 서비스 안내입니다. 법정 외부회계감사를 자동으로 대체하지 않으며, 법정 감사가 필요한 경우 수행 자격과 절차를 별도로 확인합니다.</li><li>자료 열람은 적법한 권한과 관리주체의 협조를 전제로 합니다. 자료가 부족한 항목은 검토의 한계로 명시합니다.</li><li>시설의 기술적 안전진단, 공사 원가 감정, 법률 판단과 수사는 업무 범위에 포함되지 않습니다. 필요한 경우 해당 분야 전문가와 별도로 협의합니다.</li><li>단지 규모·대상 기간·자료량·검토 범위에 따라 보수와 일정을 개별 협의하며, 조합 감독 요금제가 그대로 적용되는 것은 아닙니다.</li></ul></div>
      </section>

      <section className="bg-ink py-14 text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center"><div><h2 className="text-2xl tracking-normal md:text-3xl">우리 단지에 필요한 검토부터 시작하세요.</h2><p className="mt-3 text-sm text-primary-foreground/75">단지명, 세대 수, 검토 대상 기간과 우려되는 지출 항목을 알려주세요.</p></div><Button asChild size="lg" className="h-12 bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/contact">상담 신청 <ArrowRight /></Link></Button></div></section>
    </PageShell>
  );
}