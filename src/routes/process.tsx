import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "감독 프로세스 — 정감 컨설팅" },
      {
        name: "description",
        content: "월간 정기 감독 사이클: 자료 수집부터 조합원 보고까지의 전 과정.",
      },
      { property: "og:title", content: "감독 프로세스 — 정감 컨설팅" },
      {
        property: "og:description",
        content: "월간 정기 감독 사이클의 5단계 프로세스.",
      },
    ],
  }),
  component: ProcessPage,
});

const steps = [
  {
    n: "1",
    t: "자료 수집",
    d: "월별 회계장부, 지출결의서, 계약서, 통장 거래내역, 세무신고 자료를 표준화된 양식으로 수집합니다.",
    when: "매월 1주차",
  },
  {
    n: "2",
    t: "정합성 검토",
    d: "수집된 자료 간 일치 여부, 증빙의 충분성, 회계처리의 정확성을 항목별로 검증합니다.",
    when: "매월 2주차",
  },
  {
    n: "3",
    t: "리스크 분석",
    d: "단가 적정성, 세무 리스크, 자금집행의 합목적성을 분석하고 이상 징후를 식별합니다.",
    when: "매월 3주차",
  },
  {
    n: "4",
    t: "조합 보고",
    d: "조합 집행부에 검토 결과 보고서를 제출하고 시정·개선이 필요한 사항을 협의합니다.",
    when: "매월 4주차",
  },
  {
    n: "5",
    t: "조합원 공시",
    d: "분기별 요약 보고서를 조합원에게 공시하여 운영의 투명성을 확보합니다.",
    when: "분기 종료 익월",
  },
];

function ProcessPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Process"
        title="매월 반복되는 5단계 감독 사이클."
        description="일회성 감사가 아닌, 사업이 종료될 때까지 매월 반복되는 정형화된 프로세스로 조합 운영을 감독합니다."
      />

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          <ol className="space-y-px">
            {steps.map((s, i) => (
              <li
                key={s.n}
                className="group grid gap-8 border-t border-border py-12 md:grid-cols-12 md:gap-12"
              >
                <div className="md:col-span-2">
                  <div className="font-serif text-6xl text-foreground/15 transition-colors group-hover:text-gold">
                    0{s.n}
                  </div>
                </div>
                <div className="md:col-span-7">
                  <h3 className="font-serif text-3xl">{s.t}</h3>
                  <p className="mt-4 leading-relaxed text-foreground/70">{s.d}</p>
                </div>
                <div className="md:col-span-3 md:text-right">
                  <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    수행 시기
                  </div>
                  <div className="mt-2 font-serif text-lg text-foreground">{s.when}</div>
                </div>
                {i === steps.length - 1 && <div className="hidden md:col-span-12 border-b border-border" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-parchment py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h3 className="font-serif text-3xl">긴급 상황 대응</h3>
          <p className="mt-6 max-w-2xl leading-relaxed text-foreground/70">
            정기 사이클 외에도 거액의 자금집행, 시공사 변경, 추가 분담금 의결 등
            중대한 의사결정이 발생할 경우 24시간 내 별도의 검토 의견서를 제공합니다.
            조합원의 자산에 영향을 미치는 결정은 결코 검증 없이 통과되어서는 안 됩니다.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
