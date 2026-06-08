/* Shared types & defaults for the home section CMS payload.
   Used by:
   - src/routes/index.tsx (rendering)
   - src/components/SiteFooter.tsx (rendering)
   - src/routes/admin.dashboard.tsx (HomeEditor)
*/

export interface ComparisonCard {
  tag: string;
  title: string;
  desc: string;
  points: string[];
}

export interface ComparisonRow {
  label: string;
  audit: string;
  ours: string;
}

export interface ComparisonData {
  tag: string;
  headingLine1: string;
  headingLine2Muted: string;
  headingLine3: string;
  intro: string;
  leftCard: ComparisonCard;
  rightCard: ComparisonCard & { badge: string };
  tableHeaders: { criterion: string; audit: string; ours: string };
  rows: ComparisonRow[];
  footnote: string;
}

export interface TrustPrinciple {
  title: string;
  desc: string;
}

export interface TerminologyData {
  externalWatcher: string;       // 예: "외부 감시자"
  independentWatcher: string;    // 예: "독립적인 감시자"
  footerDescription: string;
}

export interface HomeExtData {
  comparison: ComparisonData;
  trustPrinciples: { tag: string; items: TrustPrinciple[] };
  terminology: TerminologyData;
}

export const defaultHomeExt: HomeExtData = {
  comparison: {
    tag: "회계감사와의 차이",
    headingLine1: "회계감사로는",
    headingLine2Muted: "부적절한 지출을 ",
    headingLine3: "걸러낼 수 없습니다.",
    intro:
      "회계감사는 회계기준 준수 여부만을 봅니다. 지출이 규정에 어긋나거나 과도하더라도, 장부에 적정하게 기록되어 있으면 ‘적정의견’이 나옵니다. 정감 컨설팅는 회계처리가 아닌 지출 그 자체를 검증합니다.",
    leftCard: {
      tag: "일반 회계감사",
      title: "회계처리의 적정성",
      desc:
        "회계기준에 따라 장부가 적정하게 표시되었는지를 검토합니다. 지출 자체가 부적절하더라도 회계처리만 정확하면 ‘적정의견’이 부여됩니다.",
      points: [
        "결산 후 사후 검토 중심",
        "회계기준 준수 여부만 판단",
        "지출의 타당성·규정 위반은 대상 외",
        "부적절한 지출도 ‘적정의견’ 가능",
      ],
    },
    rightCard: {
      badge: "정감 컨설팅의 영역",
      tag: "정감 컨설팅 감독",
      title: "지출 그 자체의 검증",
      desc:
        "각 지출 건이 규정에 따라 집행되었는지, 실제 발생한 지출인지, 금액이 과도하지 않은지를 사전·사후로 검증합니다.",
      points: [
        "지출 건별 사전·사후 검증",
        "조합 규정·내부 통제 준수 여부 확인",
        "실제 지출 발생 여부와 증빙 일치 점검",
        "단가·수량의 적정성과 과다 지출 판별",
      ],
    },
    tableHeaders: { criterion: "검토 기준", audit: "회계감사", ours: "정감 컨설팅 감독" },
    rows: [
      { label: "검토 대상", audit: "재무제표·장부", ours: "개별 지출 건" },
      { label: "핵심 질문", audit: "회계기준에 맞게 기록되었는가?", ours: "규정대로, 실제로, 합리적으로 지출되었는가?" },
      { label: "시점", audit: "결산 후 사후", ours: "집행 전·후 상시" },
      { label: "부적절한 지출 적발", audit: "회계처리만 맞으면 적정의견", ours: "지출 자체의 타당성을 직접 판별" },
      { label: "조합원 보호", audit: "간접적", ours: "직접적" },
    ],
    footnote:
      "* 회계감사는 법정 요건 충족을 위한 필수 절차이며, 정감 컨설팅 감독은 이를 보완하는 별개의 서비스입니다.",
  },
  trustPrinciples: {
    tag: "신뢰의 기준",
    items: [
      { title: "독립성 원칙", desc: "시공사·정비업체와 어떠한 이해관계도 맺지 않습니다." },
      { title: "비밀유지 의무", desc: "조합 자료와 의사소통은 약정에 따라 엄격히 보호됩니다." },
      { title: "직무윤리 준수", desc: "전문가 윤리 기준에 따라 객관적 의견만을 제시합니다." },
      { title: "정기 보고", desc: "분기별 검토 보고서를 통해 모든 결과를 문서로 남깁니다." },
    ],
  },
  terminology: {
    externalWatcher: "외부 감시자",
    independentWatcher: "독립적인 감시자",
    footerDescription:
      "재건축·재개발 조합의 회계 투명성과 자금 집행의 적정성을 독립적인 외부 감시자의 관점에서 검증합니다. 조합원의 자산을 지키는 마지막 방어선이 되겠습니다.",
  },
};

/** Merge partial CMS payload onto defaults so missing keys never crash UI. */
export function mergeHomeExt(data: Partial<HomeExtData> | null | undefined): HomeExtData {
  if (!data) return defaultHomeExt;
  return {
    comparison: { ...defaultHomeExt.comparison, ...(data.comparison ?? {}),
      leftCard: { ...defaultHomeExt.comparison.leftCard, ...(data.comparison?.leftCard ?? {}) },
      rightCard: { ...defaultHomeExt.comparison.rightCard, ...(data.comparison?.rightCard ?? {}) },
      tableHeaders: { ...defaultHomeExt.comparison.tableHeaders, ...(data.comparison?.tableHeaders ?? {}) },
      rows: data.comparison?.rows ?? defaultHomeExt.comparison.rows,
    },
    trustPrinciples: {
      tag: data.trustPrinciples?.tag ?? defaultHomeExt.trustPrinciples.tag,
      items: data.trustPrinciples?.items ?? defaultHomeExt.trustPrinciples.items,
    },
    terminology: { ...defaultHomeExt.terminology, ...(data.terminology ?? {}) },
  };
}
