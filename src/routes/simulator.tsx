import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Slider } from "@/components/ui/slider";
import { useSiteContent } from "@/hooks/use-site-content";
import {
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Calculator,
  Building2,
  Clock,
  BadgePercent,
} from "lucide-react";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "비용-손실 시뮬레이터 — 정감 회계" },
      {
        name: "description",
        content:
          "재건축 조합의 사업 단계별 예상 리스크와 잠재 피해액을 계산합니다. 독립 감독의 비용 절감 효과를 직접 확인하세요.",
      },
    ],
  }),
  component: SimulatorPage,
});

type Phase = "initial" | "mid" | "completion";

interface RiskItem {
  name: string;
  probability: number;
  lossRate: number;
  description: string;
}

interface PhaseConfig { label: string; risks: RiskItem[] }

interface SimulatorData {
  phases: Record<string, PhaseConfig>;
  // Pricing & supervision effect (admin-editable)
  monthlyFeeRate?: number;     // 사업비 대비 월 감독비 비율 (예: 0.00008)
  minMonthlyFee?: number;      // 최소 월 감독비 (억 원 단위, 예: 0.03 = 300만원)
  contractYears?: number;      // 계약 기간 가정 (예: 5)
  riskReductionRate?: number;  // 감독 시 리스크 저감율 (예: 0.7 → 70% 저감)
}

const phaseMeta: Record<Phase, { icon: typeof Building2; color: string }> = {
  initial: { icon: Building2, color: "text-blue-600" },
  mid: { icon: Clock, color: "text-gold" },
  completion: { icon: BadgePercent, color: "text-green-700" },
};

const defaultPhases: Record<Phase, PhaseConfig> = {
  initial: {
    label: "사업 초기",
    risks: [
      { name: "시공사 선정 비리", probability: 35, lossRate: 8, description: "시공사 선정 과정에서 뒷돈 수수, 입찰 담합 등으로 공사비가 부풀려지는 위험" },
      { name: "사업계획 허위 수립", probability: 25, lossRate: 5, description: "조합 설립 초기 사업성 분석을 과대 포장하여 조합원을 기만하는 위험" },
      { name: "초기 운영비 유용", probability: 40, lossRate: 2, description: "조합 설립 이후 운영비, 홍보비, 인건비 등을 불투명하게 집행하는 위험" },
      { name: "용역업체 과다 계약", probability: 45, lossRate: 3, description: "설계·감리·법률 용역 등의 수의계약 체결 시 시세 대비 과다한 금액 책정" },
    ],
  },
  mid: {
    label: "사업 중기",
    risks: [
      { name: "공사비 증액 부당 승인", probability: 50, lossRate: 12, description: "설계 변경, 자재 단가 상승 등을 빌미로 수백억 규모의 공사비를 부당하게 증액" },
      { name: "이주비·금융비용 부정", probability: 30, lossRate: 4, description: "조합원 이주비 대출 과정에서 금융기관과의 부적절한 거래 조건 설정" },
      { name: "공사 대금 선지급·편취", probability: 35, lossRate: 6, description: "시공 진행률 대비 과도한 선급금 지급 또는 허위 기성 청구에 의한 자금 유출" },
      { name: "회계장부 조작", probability: 40, lossRate: 5, description: "수입·지출 내역을 이중 장부로 관리하거나 허위 영수증을 통한 자금 은닉" },
      { name: "하도급 리베이트", probability: 45, lossRate: 3, description: "하도급 업체 선정 시 리베이트를 수수하여 실질적 공사 품질이 저하되는 위험" },
    ],
  },
  completion: {
    label: "사업 완료기",
    risks: [
      { name: "정산 비리", probability: 45, lossRate: 7, description: "사업 완료 후 청산 과정에서 잔여 자금의 부적절한 배분 또는 은닉" },
      { name: "추가 분담금 부당 부과", probability: 55, lossRate: 10, description: "공사비 증가분을 조합원에게 전가하면서 실제 비용 대비 과다하게 청구" },
      { name: "하자보수 예치금 유용", probability: 30, lossRate: 2, description: "하자보수 보증금을 실제 보수에 사용하지 않고 조합 운영비로 전용" },
      { name: "분양 수익 누락", probability: 25, lossRate: 4, description: "일반분양 수익 중 일부를 조합 회계에 반영하지 않고 특정인에게 귀속" },
    ],
  },
};

function formatKRW(billions: number): string {
  if (billions >= 10000) return `${(billions / 10000).toFixed(1)}조 원`;
  if (billions >= 1) return `${billions.toFixed(1)}억 원`;
  return `${(billions * 10000).toFixed(0)}만 원`;
}

function SimulatorPage() {
  const { content, loading } = useSiteContent<SimulatorData>("simulator");

  const [totalBudget, setTotalBudget] = useState([3000]);
  const [households, setHouseholds] = useState([500]);
  const [activePhase, setActivePhase] = useState<Phase>("initial");
  const [withSupervision, setWithSupervision] = useState(false);

  const budget = totalBudget[0];
  const hh = households[0];

  // Merge CMS phase data with defaults (CMS overrides if present)
  const mergedPhases: Record<Phase, PhaseConfig> = useMemo(() => {
    const result = { ...defaultPhases };
    (["initial", "mid", "completion"] as Phase[]).forEach((p) => {
      const cms = content?.phases?.[p];
      if (cms && cms.risks && cms.risks.length > 0) {
        result[p] = { label: cms.label || defaultPhases[p].label, risks: cms.risks };
      }
    });
    return result;
  }, [content]);

  // Editable financial parameters
  const monthlyFeeRate = content?.monthlyFeeRate ?? 0.00008;
  const minMonthlyFee = content?.minMonthlyFee ?? 0.03;
  const contractYears = content?.contractYears ?? 5;
  const riskReductionRate = content?.riskReductionRate ?? 0.7;
  const supervisedFactor = 1 - riskReductionRate;

  const results = useMemo(() => {
    const phases = (["initial", "mid", "completion"] as Phase[]).map((phase) => {
      const data = mergedPhases[phase];
      let totalExpectedLoss = 0;
      let totalMaxLoss = 0;

      const riskResults = data.risks.map((risk) => {
        const expectedLoss = budget * (risk.probability / 100) * (risk.lossRate / 100);
        const maxLoss = budget * (risk.lossRate / 100);
        totalExpectedLoss += expectedLoss;
        totalMaxLoss += maxLoss;
        return { ...risk, expectedLoss, maxLoss };
      });

      const supervisedLoss = totalExpectedLoss * supervisedFactor;
      const savings = totalExpectedLoss - supervisedLoss;

      return { phase, ...data, riskResults, totalExpectedLoss, totalMaxLoss, supervisedLoss, savings };
    });

    const grandTotalExpected = phases.reduce((s, p) => s + p.totalExpectedLoss, 0);
    const grandTotalMax = phases.reduce((s, p) => s + p.totalMaxLoss, 0);
    const grandTotalSavings = phases.reduce((s, p) => s + p.savings, 0);
    const grandTotalSupervised = phases.reduce((s, p) => s + p.supervisedLoss, 0);

    const monthlyFee = Math.max(budget * monthlyFeeRate, minMonthlyFee);
    const annualFee = monthlyFee * 12;
    const totalFee = annualFee * contractYears;
    const roi = totalFee > 0 ? grandTotalSavings / totalFee : 0;
    const perHousehold = grandTotalExpected / hh;

    return {
      phases, grandTotalExpected, grandTotalMax, grandTotalSavings, grandTotalSupervised,
      monthlyFee, annualFee, totalFee, roi, perHousehold,
    };
  }, [budget, hh, mergedPhases, monthlyFeeRate, minMonthlyFee, contractYears, supervisedFactor]);

  const currentPhase = results.phases.find((p) => p.phase === activePhase)!;

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">로딩 중...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Risk Simulator"
        title="단계별 비용-손실 시뮬레이터"
        description="조합의 사업 규모를 입력하면, 초기·중기·완료 단계별 예상 리스크와 잠재 피해액을 즉시 계산합니다."
      />

      {/* INPUT SECTION */}
      <section className="border-b border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <label className="text-base font-medium text-foreground">총 사업비 <span className="text-muted-foreground">(억 원)</span></label>
              <p className="mt-1 text-xs text-muted-foreground">예: 1,000세대 단지 평균 약 3,000~5,000억 원</p>
              <div className="mt-4 flex items-end gap-4">
                <span className="font-serif text-5xl text-foreground">{budget.toLocaleString()}</span>
                <span className="mb-1 text-lg text-muted-foreground">억 원</span>
              </div>
              <Slider value={totalBudget} onValueChange={setTotalBudget} min={500} max={30000} step={100} className="mt-6" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>500억</span><span>3조</span></div>
            </div>
            <div>
              <label className="text-base font-medium text-foreground">조합원 세대 수</label>
              <p className="mt-1 text-xs text-muted-foreground">조합 전체 세대 규모 (분담금 분배 단위)</p>
              <div className="mt-4 flex items-end gap-4">
                <span className="font-serif text-5xl text-foreground">{hh.toLocaleString()}</span>
                <span className="mb-1 text-lg text-muted-foreground">세대</span>
              </div>
              <Slider value={households} onValueChange={setHouseholds} min={100} max={5000} step={50} className="mt-6" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>100세대</span><span>5,000세대</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* SUMMARY BAR */}
      <section className="border-b border-border bg-ink py-12 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-px overflow-hidden rounded-sm bg-primary-foreground/10 md:grid-cols-4">
            {[
              { label: "전체 예상 손실액", value: formatKRW(results.grandTotalExpected), sub: "감독 미실시 기준", highlight: true },
              { label: "세대당 예상 피해", value: formatKRW(results.perHousehold), sub: `${hh.toLocaleString()}세대 기준` },
              { label: "감독 시 절감액", value: formatKRW(results.grandTotalSavings), sub: `리스크 ${Math.round(riskReductionRate * 100)}% 저감 적용`, positive: true },
              { label: "감독비 대비 ROI", value: `${results.roi.toFixed(0)}배`, sub: `월 ${formatKRW(results.monthlyFee)} 기준`, positive: true },
            ].map((s) => (
              <div key={s.label} className={`relative p-8 ${s.highlight ? "bg-destructive/20 border-l-2 border-l-destructive" : s.positive ? "bg-primary-foreground/5 border-l-2 border-l-gold" : "bg-primary-foreground/5"}`}>
                <div className="text-xs uppercase tracking-wider text-primary-foreground/60">{s.label}</div>
                <div className={`mt-2 font-serif text-3xl ${s.positive ? "text-gold" : s.highlight ? "text-destructive-foreground" : ""}`}>{s.value}</div>
                <div className="mt-1 text-xs text-primary-foreground/40">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHASE TABS */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
            <Calculator className="h-3.5 w-3.5" />
            단계별 상세 분석
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {results.phases.map((p) => {
              const Icon = phaseMeta[p.phase as Phase].icon;
              const isActive = p.phase === activePhase;
              return (
                <button
                  key={p.phase}
                  type="button"
                  onClick={() => setActivePhase(p.phase as Phase)}
                  className={`rounded-sm border p-6 text-left transition-all ${
                    isActive ? "border-gold bg-gold/5 shadow-soft" : "border-border bg-card hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-6 w-6 ${isActive ? "text-gold" : "text-muted-foreground"}`} strokeWidth={1.5} />
                    <span className="font-serif text-2xl text-foreground/15">
                      {p.phase === "initial" ? "01" : p.phase === "mid" ? "02" : "03"}
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{p.label}</h3>
                  <div className="mt-2 text-sm text-muted-foreground">리스크 항목 {p.riskResults.length}건</div>
                  <div className="mt-4 border-t border-border pt-4">
                    <div className="text-xs text-muted-foreground">예상 손실</div>
                    <div className="mt-1 font-serif text-xl text-destructive">{formatKRW(p.totalExpectedLoss)}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex items-center gap-4">
            <button type="button" onClick={() => setWithSupervision(false)} className={`rounded-sm px-5 py-2.5 text-sm font-medium transition-all ${!withSupervision ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <AlertTriangle className="mr-2 inline h-4 w-4" />감독 미실시
            </button>
            <button type="button" onClick={() => setWithSupervision(true)} className={`rounded-sm px-5 py-2.5 text-sm font-medium transition-all ${withSupervision ? "bg-gold text-ink" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <ShieldCheck className="mr-2 inline h-4 w-4" />감독 실시
            </button>
          </div>

          <div className="mt-8 overflow-hidden rounded-sm border border-border">
            <div className="grid grid-cols-[1fr_100px_100px_140px] gap-px bg-border text-xs font-medium uppercase tracking-wider text-muted-foreground md:grid-cols-[1fr_120px_120px_160px]">
              <div className="bg-parchment p-4">리스크 항목</div>
              <div className="bg-parchment p-4 text-center">발생 확률</div>
              <div className="bg-parchment p-4 text-center">손실 비율</div>
              <div className="bg-parchment p-4 text-right">{withSupervision ? "감독 후 예상 손실" : "예상 손실액"}</div>
            </div>
            {currentPhase.riskResults.map((risk) => {
              const displayLoss = withSupervision ? risk.expectedLoss * supervisedFactor : risk.expectedLoss;
              const displayProb = withSupervision ? Math.round(risk.probability * supervisedFactor) : risk.probability;
              return (
                <div key={risk.name} className="group grid grid-cols-[1fr_100px_100px_140px] gap-px bg-border md:grid-cols-[1fr_120px_120px_160px]">
                  <div className="bg-card p-4">
                    <div className="text-sm font-medium">{risk.name}</div>
                    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{risk.description}</div>
                  </div>
                  <div className="flex items-center justify-center bg-card p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-foreground/10">
                        <div className={`h-full rounded-full transition-all duration-500 ${withSupervision ? "bg-gold" : "bg-destructive"}`} style={{ width: `${displayProb}%` }} />
                      </div>
                      <span className="text-sm font-medium">{displayProb}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center bg-card p-4 text-sm">{risk.lossRate}%</div>
                  <div className={`flex items-center justify-end bg-card p-4 font-serif text-base ${withSupervision ? "text-gold" : "text-destructive"}`}>
                    {formatKRW(displayLoss)}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-[1fr_100px_100px_140px] gap-px bg-border md:grid-cols-[1fr_120px_120px_160px]">
              <div className="bg-parchment p-4 text-sm font-medium">{currentPhase.label} 합계</div>
              <div className="bg-parchment p-4" />
              <div className="bg-parchment p-4" />
              <div className={`bg-parchment p-4 text-right font-serif text-lg font-semibold ${withSupervision ? "text-gold" : "text-destructive"}`}>
                {formatKRW(withSupervision ? currentPhase.supervisedLoss : currentPhase.totalExpectedLoss)}
              </div>
            </div>
          </div>

          {withSupervision && (
            <div className="mt-8 rounded-sm border border-gold/30 bg-gold/5 p-8">
              <div className="flex items-start gap-4">
                <TrendingDown className="mt-1 h-6 w-6 flex-shrink-0 text-gold" />
                <div>
                  <h4 className="font-serif text-xl">{currentPhase.label} 감독 효과</h4>
                  <p className="mt-2 text-foreground/70">
                    독립 회계 감독을 실시할 경우, {currentPhase.label} 단계에서만{" "}
                    <strong className="text-gold">{formatKRW(currentPhase.savings)}</strong>의 잠재적 손실을 예방할 수 있습니다. 이는 세대당{" "}
                    <strong>{formatKRW(currentPhase.savings / hh)}</strong>에 해당하는 금액입니다.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPARISON CHART */}
      <section className="border-t border-border bg-parchment py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-serif text-3xl md:text-4xl">전체 사업 기간 비교</h2>
          <p className="mt-4 max-w-2xl text-foreground/70">감독 미실시와 실시 시의 예상 손실을 단계별로 비교합니다. 막대가 짧을수록 조합원의 자산이 안전합니다.</p>

          <div className="mt-12 space-y-8">
            {results.phases.map((p) => {
              const maxVal = Math.max(...results.phases.map((pp) => pp.totalExpectedLoss));
              const unsupervisedWidth = (p.totalExpectedLoss / maxVal) * 100;
              const supervisedWidth = (p.supervisedLoss / maxVal) * 100;
              return (
                <div key={p.phase}>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-serif text-lg">{p.label}</h3>
                    <div className="text-sm text-muted-foreground">리스크 {p.riskResults.length}건</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-right text-xs text-muted-foreground">미실시</div>
                    <div className="flex-1">
                      <div className="h-8 overflow-hidden rounded-sm bg-foreground/5">
                        <div className="flex h-full items-center rounded-sm bg-destructive/80 px-3 text-xs font-medium text-destructive-foreground transition-all duration-700" style={{ width: `${Math.max(unsupervisedWidth, 8)}%` }}>
                          {formatKRW(p.totalExpectedLoss)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-20 text-right text-xs text-gold">감독 실시</div>
                    <div className="flex-1">
                      <div className="h-8 overflow-hidden rounded-sm bg-foreground/5">
                        <div className="flex h-full items-center rounded-sm bg-gold/80 px-3 text-xs font-medium text-ink transition-all duration-700" style={{ width: `${Math.max(supervisedWidth, 8)}%` }}>
                          {formatKRW(p.supervisedLoss)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 rounded-sm border border-gold/30 bg-card p-10 text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">전체 사업 기간 총 절감 효과</div>
            <div className="mt-4 font-serif text-5xl text-gold md:text-6xl">{formatKRW(results.grandTotalSavings)}</div>
            <p className="mx-auto mt-4 max-w-lg text-foreground/60">
              월 <strong className="text-foreground">{formatKRW(results.monthlyFee)}</strong>의 감독 비용으로, {contractYears}년간 총{" "}
              <strong className="text-foreground">{formatKRW(results.totalFee)}</strong>를 투자하여{" "}
              <strong className="text-gold">{results.roi.toFixed(0)}배</strong>의 손실 예방 효과를 기대할 수 있습니다.
            </p>
            <div className="mt-2 text-xs text-muted-foreground">* 국토교통부 통계 및 업계 평균 기반 시뮬레이션이며, 실제 결과는 사업장에 따라 달라질 수 있습니다.</div>
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl">시뮬레이션 결과가 예상보다 크셨나요?</h2>
          <p className="mx-auto mt-6 max-w-xl text-primary-foreground/70">실제 조합의 사업비와 리스크 구조를 분석하여, 맞춤형 감독 제안서를 무료로 작성해 드립니다.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 text-sm font-medium text-ink hover:opacity-90">
              맞춤 분석 요청하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/cases" className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 px-8 py-4 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10">
              실제 피해 사례 보기
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
