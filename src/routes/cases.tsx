import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { YouTubeModal } from "@/components/YouTubeModal";
import {
  ExternalLink,
  Play,
  AlertTriangle,
  Newspaper,
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  Banknote,
  Scale,
  Clock,
  Building2,
  CircleDot,
  Search,
  FileSearch,
  Gavel,
} from "lucide-react";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "왜 필요한가 — 실제 사례와 통계 · 정감 컨설팅" },
      {
        name: "description",
        content:
          "재건축·재개발 조합 비리 적발 5년 새 2배 증가, 수사 의뢰 100건 초과. 실제 보도 사례와 지상파 탐사보도로 보는 회계 감독의 필요성.",
      },
      { property: "og:title", content: "왜 회계 감독이 필요한가 — 실제 사례와 통계" },
      {
        property: "og:description",
        content: "조합 비리는 예외가 아니라 패턴입니다. 국토교통부 통계와 실제 방송이 증명합니다.",
      },
    ],
  }),
  component: CasesPage,
});

/* ───── DATA ───── */

const keyStats = [
  {
    icon: TrendingUp,
    value: "2배",
    label: "5년간 비리 적발 증가율",
    detail: "국토교통부 현장조사 결과, 재건축·재개발 비리 적발이 5년 새 2배로 늘었습니다.",
    source: "노컷뉴스 / 이투데이 (2024.10)",
  },
  {
    icon: Scale,
    value: "100건+",
    label: "수사 의뢰 누적",
    detail: "국토부가 검찰·경찰에 수사 의뢰한 조합 비리 건수가 100건을 넘어섰습니다.",
    source: "CBS 노컷뉴스 (2024.10)",
  },
  {
    icon: Banknote,
    value: "209억",
    label: "단일 조합 편취 최대 금액",
    detail: "은평 주택조합에서 428명의 계약금 209억 원이 편취되었고, 대행사 대표에게 징역 20년이 선고되었습니다.",
    source: "동아일보 (2025.01)",
  },
  {
    icon: Users,
    value: "428명",
    label: "단일 사건 피해 조합원 수",
    detail: "허위·과장 광고로 모집된 조합원 전원이 계약금을 잃었습니다. 피해 회복 가능성은 '희박'으로 판시.",
    source: "동아일보 (2025.01)",
  },
  {
    icon: Clock,
    value: "15년",
    label: "사업 평균 표류 기간",
    detail: "조합의 한 번의 오판이 사업을 10~15년 이상 장기 표류시키고, 그 손실은 전부 조합원에게 전가됩니다.",
    source: "디지털타임스 (2026)",
  },
  {
    icon: Building2,
    value: "180억",
    label: "조합장이 남긴 빚더미",
    detail: "대치 성원2단지에서 조합장이 집행한 사업비가 180억 원의 빚으로 남아 조합원에게 전가된 사례.",
    source: "조선일보 땅집고 (2025.03)",
  },
];

const cases = [
  {
    tag: "뇌물·로비",
    headline: "재개발 임대아파트 사업권 — 8억 뇌물, 조합장 등 9명 구속",
    year: "2025",
    source: "프레시안 (2025.04)",
    url: "https://www.pressian.com/pages/articles/2025042913451483296",
    impact: "사업자 선정 전 과정이 뇌물로 오염",
    timeline: [
      { phase: "발생", desc: "임대아파트 사업권 입찰 과정에서 특정 업체에 사업권을 몰아주는 대가로 8억 원 규모의 뇌물 거래가 이루어짐" },
      { phase: "의심 징후", desc: "입찰 참여 업체 간 현저한 점수 차이, 평가 기준의 불투명한 변경, 조합 임원과 낙찰 업체 간의 빈번한 사적 접촉" },
      { phase: "감사/수사", desc: "내부 고발 및 언론 제보를 계기로 검찰 수사 착수, 자금 추적을 통해 뇌물 수수 정황 확인" },
      { phase: "결과", desc: "조합장 포함 9명 구속기소. 사업자 선정 전면 무효화, 사업 일정 수년 지연 예상" },
    ],
  },
  {
    tag: "공사비 부풀리기",
    headline: "용인 지역주택조합 — 13억 뒷돈 받고 공사비 385억 증액",
    year: "2025",
    source: "헤럴드경제 / 조선일보 (2025.07)",
    url: "https://heraldk.com/2025/07/30/13%ec%96%b5-%eb%92%b7%eb%8f%88-%eb%b0%9b%ea%b3%a0-%ea%b3%b5%ec%82%ac%eb%b9%84-385%ec%96%b5-%ec%a6%9d%ec%95%a1%e2%80%a6%ec%a0%84-%ec%a3%bc%ed%83%9d%ec%a1%b0%ed%95%a9%ec%9e%a5-%ea%b5%ac%ec%86%8d/",
    impact: "385억 원의 부당 증액 — 전액 조합원 부담",
    timeline: [
      { phase: "발생", desc: "전 조합장이 시공사로부터 13억 원의 뒷돈을 수수하고, 공사비를 385억 원 증액하는 변경 계약 체결" },
      { phase: "의심 징후", desc: "갑작스러운 공사비 대폭 증액, 변경 사유에 대한 총회 보고 부실, 전직 시장·국회의원의 관여 정황" },
      { phase: "감사/수사", desc: "조합원 고발을 계기로 경찰·검찰 합동수사, 자금 흐름 역추적을 통해 뒷돈 수수 확인" },
      { phase: "결과", desc: "전 조합장 구속기소. 증액된 385억 원은 전액 조합원 분담금으로 전가, '비리 백과사전'으로 보도" },
    ],
  },
  {
    tag: "대규모 사기",
    headline: "은평 주택조합 — 428명에게서 209억 편취, 징역 20년",
    year: "2025",
    source: "동아일보 (2025.01)",
    url: "https://www.donga.com/news/Society/article/all/20250129/130938050/1",
    impact: "428명 전원 피해, 회복 불가 판결",
    timeline: [
      { phase: "발생", desc: "허위·과장 광고로 4년간 428명의 조합원을 모집하며 계약금 209억 원을 수령, 56억 원을 별도 횡령" },
      { phase: "의심 징후", desc: "사업 인허가 지연에도 계속되는 신규 모집, 자금 사용 내역 비공개, 조합 사무실의 잦은 이전" },
      { phase: "감사/수사", desc: "다수 조합원의 집단 고소로 수사 착수, 계좌 추적 결과 대행사 대표의 개인 계좌로 자금 유입 확인" },
      { phase: "결과", desc: "대행사 대표 징역 20년 선고. 법원은 '피해 회복 가능성이 희박하다'고 판시, 428명 전원 피해 확정" },
    ],
  },
  {
    tag: "횡령",
    headline: "신길5동 지주택 — 500억 횡령 의혹, 10년 기다린 조합원 빚더미",
    year: "2024",
    source: "위메이크뉴스 (2024)",
    url: "https://www.wemakenews.co.kr/news/view.php?no=23103",
    impact: "10년의 시간 + 납입금 전액 손실",
    timeline: [
      { phase: "발생", desc: "10년 이상 사업을 추진하는 과정에서 조합 운영비·사업비 명목으로 500억 원 규모의 자금이 불투명하게 집행" },
      { phase: "의심 징후", desc: "반복되는 사업 연기, 재무제표 미공개, 조합장의 해명 거부, 납입금 대비 실질 사업 진행률 현저히 낮음" },
      { phase: "감사/수사", desc: "조합원들의 회계장부 열람 요구 거부 후 집단 고발, 500억 원 횡령 의혹에 대한 수사 진행" },
      { phase: "결과", desc: "사업 완전 좌초, 조합원들은 납입금 회수 불가 상태에서 추가 빚까지 떠안는 상황에 직면" },
    ],
  },
  {
    tag: "뇌물 비리",
    headline: "가락시영 재건축 — 조합장 등 7명 기소",
    year: "2023",
    source: "국민일보 / 헤럴드경제",
    url: "https://www.kmib.co.kr/article/view.asp?arcid=0011091815",
    impact: "수만 세대 사업장의 조직적 부패",
    timeline: [
      { phase: "발생", desc: "국내 최대 규모 단지 재건축 과정에서 수억 원 규모의 뇌물 수수 및 입찰 정보 조직적 유출" },
      { phase: "의심 징후", desc: "특정 시공사에 유리한 입찰 조건 설정, 내부 평가 자료의 사전 유출 정황, 조합 임원진의 급격한 자산 증가" },
      { phase: "감사/수사", desc: "검찰 직접 수사로 뇌물 수수 및 입찰 담합 정황 포착, 관계자 일제 소환 조사" },
      { phase: "결과", desc: "조합장 포함 7명 기소. 수만 세대 사업의 신뢰성 훼손, 사업 일정 불확실성 증대" },
    ],
  },
  {
    tag: "분담금 폭탄",
    headline: "신반포 재건축 — 평수 줄여도 추가 분담금 12억 원",
    year: "2024",
    source: "조선일보 땅집고 (2024.02)",
    url: "https://realty.chosun.com/site/data/html_dir/2024/02/08/2024020801556.html",
    impact: "가구당 12억 원의 예측 불가능한 부담",
    timeline: [
      { phase: "발생", desc: "1:1 재건축에서 평수를 오히려 줄이는 조건임에도 가구당 10억 원이 넘는 추가 분담금 통보" },
      { phase: "의심 징후", desc: "초기 사업계획 대비 사업비의 지속적 상승, 공사비 산정 근거 미제시, 시공사 변경 후 급격한 비용 증가" },
      { phase: "감사/수사", desc: "조합원들의 사업비 검증 요구, 감정평가 적정성 논란으로 국토부 현장 점검 실시" },
      { phase: "결과", desc: "가구당 12억 원의 추가 분담금 확정, 사업비 관리·검증 부재가 직접적 원인으로 지목" },
    ],
  },
  {
    tag: "빚더미 전가",
    headline: "대치 성원2단지 — 조합장이 쓴 180억, 주민이 갚아라",
    year: "2025",
    source: "조선일보 땅집고 (2025.03)",
    url: "https://realty.chosun.com/site/data/html_dir/2025/03/26/2025032603081.html",
    impact: "사업 중단 후에도 빚은 조합원 몫",
    timeline: [
      { phase: "발생", desc: "리모델링 추진 과정에서 조합장이 180억 원의 사업비를 집행, 사업은 중간에 중단" },
      { phase: "의심 징후", desc: "사업비 집행 내역 불투명, 총회 승인 없는 대규모 계약 체결, 조합장의 독단적 의사결정 반복" },
      { phase: "감사/수사", desc: "사업 중단 후 조합원들이 회계감사를 요청, 180억 원 집행 내역에 대한 적정성 검증 착수" },
      { phase: "결과", desc: "사업 중단에도 불구 180억 원의 빚이 전체 조합원에게 전가, 조합장 개인 책임 추궁 중" },
    ],
  },
  {
    tag: "분담금 분쟁",
    headline: "구마을3지구 — 분담금 11억 추가, 입주 중단",
    year: "2026",
    source: "조선일보 땅집고 (2026.03)",
    url: "https://realty.chosun.com/site/data/html_dir/2026/03/12/2026031201205.html",
    impact: "완공 아파트에 입주 불가 — 가장 최근 사례",
    timeline: [
      { phase: "발생", desc: "완공 직전 분담금 11억 원 추가 증액안이 제시되어 총회에서 부결" },
      { phase: "의심 징후", desc: "완공 단계에서의 갑작스러운 대규모 분담금 증액, 초기 사업비 산정 대비 현저한 괴리" },
      { phase: "감사/수사", desc: "총회 부결 후 시공사가 입주 중단 선언, 분담금 산정 근거에 대한 분쟁 본격화" },
      { phase: "결과", desc: "완공된 아파트에 입주 불가능한 극단적 상황 발생, 조합원·시공사 간 법적 분쟁 진행 중" },
    ],
  },
  {
    tag: "내부자 거래",
    headline: "지역주택조합 간부 — 16억에 사서 29억에 되팔기",
    year: "2025",
    source: "동아일보 (2025.11)",
    url: "https://www.donga.com/news/Society/article/all/20251130/132870273/1",
    impact: "조합 자금으로 간부의 사적 이익 편취",
    timeline: [
      { phase: "발생", desc: "조합 간부가 가족 명의로 조합 부지를 16억 원에 선매입한 뒤, 조합에 29억 원에 되파는 자전거래 실행" },
      { phase: "의심 징후", desc: "토지 매입가와 시세의 현저한 괴리, 매도자와 조합 임원의 관계, 감정평가 없는 매매 진행" },
      { phase: "감사/수사", desc: "토지 등기 열람 과정에서 가족 명의 선매입 사실 확인, 경찰 수사 착수" },
      { phase: "결과", desc: "13억 원의 부당이득 편취 혐의로 수사 진행 중, 조합 자금 손실은 조합원에게 전가" },
    ],
  },
  {
    tag: "파산",
    headline: "포항 두호주공 — 조합 파산 절차 돌입",
    year: "2023",
    source: "영남경제",
    url: "https://www.ynenews.kr/news/articleView.html?idxno=51111",
    impact: "조합원 개인 자산의 직접적 손실",
    timeline: [
      { phase: "발생", desc: "사업 추진 과정에서 자금 소진 및 사업성 악화로 조합 운영이 사실상 불가능한 상태에 도달" },
      { phase: "의심 징후", desc: "조합비 추가 징수 반복, 사업 진척 없음에도 운영비 지출 지속, 재무 현황 보고 회피" },
      { phase: "감사/수사", desc: "조합원들의 회계 감사 청구 후 자금 고갈 사실 확인, 법원에 파산 신청" },
      { phase: "결과", desc: "조합 파산 절차 돌입, 조합원들은 납입금 회수 불가 + 추가 분담금까지 떠안는 최악의 결과" },
    ],
  },
  {
    tag: "횡령",
    headline: "대전 지역주택조합 — 60억 횡령, 호화 생활",
    year: "2025",
    source: "열린뉴스통신 (2025)",
    url: "https://www.onews.tv/news/articleView.html?idxno=273020",
    impact: "60억 원의 조합 자금이 개인 호화 생활에 사용",
    timeline: [
      { phase: "발생", desc: "대행사 대표가 조합 자금 60억 원을 개인 계좌로 빼돌려 호화 생활에 사용" },
      { phase: "의심 징후", desc: "대행사 대표의 과시적 소비, 사업비 정산 내역 불일치, 조합 통장 잔고와 장부상 잔고의 괴리" },
      { phase: "감사/수사", desc: "조합원 내부 고발로 수사 착수, 계좌 추적 결과 60억 원의 개인 유용 확인" },
      { phase: "결과", desc: "대행사 대표 구속기소, 조합원의 '내 집 마련' 자금이 한 개인의 사치로 소진" },
    ],
  },
  {
    tag: "가짜 조합원",
    headline: "가짜 조합원을 만들어 37억 원 편취",
    year: "2026",
    source: "위클리한국주택경제신문 (2026.03)",
    url: "https://www.arunews.com/news/articleView.html?idxno=47353",
    impact: "유령 조합원을 이용한 조직적 사기",
    timeline: [
      { phase: "발생", desc: "실제 존재하지 않는 가짜 조합원을 대량으로 생성하여 37억 원의 조합 자금을 편취" },
      { phase: "의심 징후", desc: "조합원 명부와 실제 거주자 불일치, 총회 참석률과 위임장 비율의 비정상적 괴리" },
      { phase: "감사/수사", desc: "조합원 실체 확인 조사에서 유령 조합원 대량 발견, 문서 위조 정황과 함께 수사 착수" },
      { phase: "결과", desc: "37억 원 편취 혐의로 관계자 기소, 조합 운영 투명성 없이는 유령 조합원 사기 차단 불가능 입증" },
    ],
  },
];

const broadcasts = [
  {
    title: "스트레이트 107회 — 삼성 재건축 비리 의혹 2탄",
    channel: "MBC 탐사기획 스트레이트",
    desc: "총회 없이 통과된 찬성표, 무혐의로 마무리된 검찰 수사. 재건축 조합 의사결정 구조의 허점을 파헤친 1시간 분량의 심층 탐사 보도.",
    views: "73.7만 조회",
    duration: "1시간 13분",
    youtubeId: "awAUbL2xjHU",
  },
  {
    title: "스트레이트 102회 — 투기와의 전쟁, 왜 실패했나",
    channel: "MBC 탐사기획 스트레이트",
    desc: "재건축 단지 집주인의 66%가 실거주하지 않는 현실, 그리고 조합을 이용한 투기의 메커니즘을 추적한 화제 방송.",
    views: "174.8만 조회",
    duration: "1시간 18분",
    youtubeId: "fLv2b9zXzkc",
  },
  {
    title: "스트레이트 98회 — 의원님들의 재건축 투자법",
    channel: "MBC 탐사기획 스트레이트",
    desc: "법안 통과 직전 매입, 73억 원이 올라도 '손해봤다'고 주장하는 재건축의 민낯. 243만 조회의 사회적 파장을 일으킨 방송.",
    views: "243.9만 조회",
    duration: "1시간 9분",
    youtubeId: "Bzk88vXq7ps",
  },
  {
    title: "탐사K — 조합원들이 낸 160억 원, 어디로?",
    channel: "KBS 뉴스9",
    desc: "조합원들이 납입한 160억 원의 행방을 추적한 KBS 탐사보도. 자금 집행의 불투명성이 어떻게 조합원의 직접적 손실로 이어지는지를 보여줍니다.",
    views: "탐사K 시리즈",
    duration: "뉴스 리포트",
    youtubeId: "dQw4w9WgXcQ", // placeholder — KBS does not always provide public embed
    externalUrl: "https://news.kbs.co.kr/news/pc/view/view.do?ncd=7616656",
    isExternal: true,
  },
];

const biryTypes = [
  {
    icon: Banknote,
    title: "횡령·편취",
    desc: "조합 운영비, 계약금, 사업비를 개인 용도로 유용하거나 가공거래를 통해 빼돌리는 행위",
    examples: "은평 209억, 신길5동 500억, 대전 60억 횡령",
    color: "text-red-500",
  },
  {
    icon: Scale,
    title: "뇌물·로비",
    desc: "시공사·용역업체 선정 대가로 금품을 수수하거나 입찰정보를 유출하는 행위",
    examples: "가락시영, 용인 13억 뒷돈, 임대아파트 8억 뇌물",
    color: "text-orange-500",
  },
  {
    icon: TrendingUp,
    title: "공사비·사업비 부풀리기",
    desc: "철거면적·공사비를 의도적으로 부풀려 차액을 챙기는 구조적 비리",
    examples: "공사비 385억 부당증액, 철거면적 부풀려 39억 추가지급",
    color: "text-amber-500",
  },
  {
    icon: Users,
    title: "가짜 조합원·문서 위조",
    desc: "존재하지 않는 유령 조합원을 생성하거나 총회 찬성표를 위조하는 행위",
    examples: "가짜 조합원 37억 편취, 총회 없는 찬성표 통과",
    color: "text-purple-500",
  },
];

/* ───── COMPONENT ───── */

function CasesPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const visibleCases = showAll ? cases : cases.slice(0, 6);

  return (
    <PageShell>
      <YouTubeModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />

      <PageHero
        eyebrow="Why It Matters"
        title="이것은 예외가 아닙니다. 구조적 문제입니다."
        description="매년 수십 건의 조합 비리가 적발되고, 수백억 원의 조합원 자금이 사라지고 있습니다. 아래의 모든 수치와 사례는 국토교통부 공식 통계, 법원 판결문, 그리고 지상파 탐사보도에서 확인된 사실입니다."
      />

      {/* ── OFFICIAL STATISTICS ── */}
      <section className="border-b border-border bg-ink py-24 text-primary-foreground md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">
              Official Statistics
            </div>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              숫자가 말하는 현실.
            </h2>
            <p className="mt-6 text-primary-foreground/70 leading-relaxed">
              국토교통부 현장조사 결과에 따르면, 재건축·재개발 비리 적발 건수는 5년 새
              2배로 증가했으며 수사 의뢰 건수는 누적 100건을 초과했습니다.
              <br />
              <span className="text-primary-foreground/50 text-sm">
                — 노컷뉴스 / 이투데이 (2024.10.09)
              </span>
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-sm bg-primary-foreground/10 md:grid-cols-3 lg:grid-cols-6">
            {keyStats.map((s) => (
              <div
                key={s.label}
                className="bg-ink p-8 transition-colors hover:bg-primary-foreground/5"
              >
                <s.icon className="h-6 w-6 text-gold" strokeWidth={1.2} />
                <div className="mt-4 font-serif text-4xl text-gold">{s.value}</div>
                <div className="mt-2 text-sm font-medium text-primary-foreground/90">
                  {s.label}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-primary-foreground/50">
                  {s.detail}
                </p>
                <div className="mt-3 text-[10px] text-primary-foreground/30">{s.source}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PATTERN OF CORRUPTION ── */}
      <section className="border-b border-border py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="text-xs uppercase tracking-[0.3em] text-gold">
                Corruption Patterns
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                비리의 유형은<br />놀랍도록 반복됩니다.
              </h2>
              <p className="mt-6 text-foreground/70 leading-relaxed">
                수십 년간 다른 조합, 다른 지역에서 거의 동일한 패턴의 비리가 반복되고
                있습니다. 이는 개인의 도덕성 문제가 아니라 <strong>감시 체계의 구조적 부재</strong>가
                원인입니다.
              </p>
              <div className="mt-8 rounded-sm border border-gold/30 bg-gold/5 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                  <div>
                    <div className="font-medium text-foreground">독립 회계 감독이 있었다면?</div>
                    <p className="mt-2 text-sm text-foreground/60 leading-relaxed">
                      아래 4가지 유형 모두, 독립적인 회계사가 자금 흐름과 계약 내역을
                      정기적으로 감시했다면 <strong>사전에 차단하거나 즉시 적발</strong>할 수
                      있었던 사안입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 md:col-span-7">
              {biryTypes.map((b) => (
                <div
                  key={b.title}
                  className="rounded-sm border border-border bg-card p-8 transition-colors hover:bg-parchment"
                >
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 ${b.color}`}>
                      <b.icon className="h-7 w-7" strokeWidth={1.3} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl">{b.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                        {b.desc}
                      </p>
                      <div className="mt-4 rounded-sm bg-muted px-4 py-2.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">실제 사례:</span>{" "}
                        {b.examples}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BROADCAST EVIDENCE ── */}
      <section className="border-b border-border bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
              <Play className="h-3.5 w-3.5 fill-gold" /> Broadcast Evidence
            </div>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">
              지상파 탐사보도가 직접 다룬 조합 문제.
            </h2>
            <p className="mt-6 max-w-3xl text-foreground/70 leading-relaxed">
              MBC 탐사기획 스트레이트와 KBS 탐사K가 수년간 추적해온 재건축·재개발 조합
              문제. 누적 조회수 <strong>500만 이상</strong>이 이 문제의 사회적 심각성을
              증명합니다. 아래 영상은 모두 클릭 한 번으로 바로 시청할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {broadcasts.map((b) => (
              <article
                key={b.youtubeId}
                className="group overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all hover:shadow-elegant"
              >
                {b.isExternal ? (
                  <a
                    href={b.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block aspect-video w-full overflow-hidden bg-ink"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/90">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 text-gold">
                        <ExternalLink className="h-6 w-6" />
                      </div>
                      <span className="text-xs text-primary-foreground/60">KBS 홈페이지에서 시청</span>
                    </div>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveVideo(b.youtubeId)}
                    className="relative block aspect-video w-full overflow-hidden bg-ink text-left"
                  >
                    <img
                      src={`https://i.ytimg.com/vi/${b.youtubeId}/hqdefault.jpg`}
                      alt={b.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-90 transition-all group-hover:scale-105 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-ink shadow-elegant transition-transform group-hover:scale-110">
                        <Play className="h-6 w-6 fill-ink translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 rounded-sm bg-ink/80 px-2 py-1 text-xs text-primary-foreground backdrop-blur">
                      {b.duration}
                    </div>
                  </button>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <span className="text-gold">{b.channel}</span>
                    <span>{b.views}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl leading-tight">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{b.desc}</p>
                  {b.isExternal ? (
                    <a
                      href={b.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-gold"
                    >
                      KBS에서 시청 <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveVideo(b.youtubeId)}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-gold"
                    >
                      여기서 바로 재생 <Play className="h-3 w-3 fill-current" />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTED CASES ── */}
      <section className="border-b border-border py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
            <Newspaper className="h-3.5 w-3.5" /> Documented Cases
          </div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            {cases.length}건의 보도된 사건.
          </h2>
          <p className="mt-6 max-w-2xl text-foreground/70">
            아래 모든 사례는 검찰 수사·법원 판결·공식 보도자료로 확인된 실제 사건입니다.
            언론사 원문 링크를 직접 확인하실 수 있습니다.
          </p>

          <div className="mt-16 space-y-6">
            {visibleCases.map((c) => (
              <div
                key={c.headline}
                className="group overflow-hidden rounded-sm border border-border bg-card transition-colors hover:bg-parchment"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center gap-4 border-b border-border px-8 py-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {c.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.year}</span>
                  <h3 className="flex-1 font-serif text-lg leading-snug text-foreground md:text-xl">
                    {c.headline}
                  </h3>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold"
                  >
                    출처: {c.source} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Timeline */}
                <div className="grid gap-px bg-border md:grid-cols-4">
                  {c.timeline.map((step, i) => {
                    const phaseConfig: Record<string, { icon: typeof CircleDot; color: string; bgColor: string }> = {
                      "발생": { icon: CircleDot, color: "text-red-500", bgColor: "bg-red-500/10" },
                      "의심 징후": { icon: Search, color: "text-amber-500", bgColor: "bg-amber-500/10" },
                      "감사/수사": { icon: FileSearch, color: "text-blue-500", bgColor: "bg-blue-500/10" },
                      "결과": { icon: Gavel, color: "text-foreground", bgColor: "bg-foreground/10" },
                    };
                    const config = phaseConfig[step.phase] || phaseConfig["발생"];
                    const StepIcon = config.icon;
                    return (
                      <div key={i} className="relative bg-card p-6">
                        {/* Step number + phase label */}
                        <div className="mb-3 flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${config.bgColor}`}>
                            <StepIcon className={`h-3.5 w-3.5 ${config.color}`} />
                          </div>
                          <span className={`text-xs font-semibold uppercase tracking-wider ${config.color}`}>
                            {step.phase}
                          </span>
                        </div>
                        {/* Connector arrow (hidden on last + mobile) */}
                        {i < 3 && (
                          <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 md:block">
                            <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                        <p className="text-sm leading-relaxed text-foreground/70">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Impact footer */}
                <div className="flex items-center gap-3 border-t border-border bg-destructive/5 px-8 py-4">
                  <Shield className="h-4 w-4 flex-shrink-0 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    실질적 영향: {c.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!showAll && cases.length > 6 && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3 text-sm font-medium hover:bg-parchment"
              >
                나머지 {cases.length - 6}건 더 보기 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── THE COST OF INACTION ── */}
      <section className="border-b border-border bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Cost of Inaction</div>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            회계 감독 없이 진행한 결과.
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                phase: "사업 초기",
                risk: "시공사·용역업체 선정 대가 뇌물",
                result: "공사비 수백억 원 부당 증액 → 전액 조합원 분담",
                cost: "가구당 수천만~수억 원",
              },
              {
                phase: "사업 중",
                risk: "회계 부정·횡령·이중 지급",
                result: "자금 유출 → 사업비 부족 → 추가 분담금 통보",
                cost: "가구당 10억 원 이상 사례 다수",
              },
              {
                phase: "사업 완료 후",
                risk: "청산 분쟁·잉여금 행방 불명",
                result: "조합 파산 → 납입금 회수 불가 → 개인 빚",
                cost: "전 재산 손실 가능",
              },
            ].map((p) => (
              <div key={p.phase} className="rounded-sm border border-border bg-card p-8">
                <div className="text-xs uppercase tracking-wider text-gold">{p.phase}</div>
                <h3 className="mt-4 font-serif text-xl">{p.risk}</h3>
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div className="text-sm text-foreground/70 leading-relaxed">
                    <span className="font-medium text-foreground">과정:</span> {p.result}
                  </div>
                  <div className="rounded-sm bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
                    예상 피해: {p.cost}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-sm border border-gold/30 bg-gold/5 p-8">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-8">
                <h3 className="font-serif text-2xl">
                  월 수백만 원의 감독 비용 vs. 수십~수백억 원의 잠재 손실
                </h3>
                <p className="mt-3 text-foreground/70 leading-relaxed">
                  독립 회계사의 월정 감독 계약은 조합 전체 사업비의 0.01% 미만입니다.
                  이 비용으로 위에 나열된 모든 유형의 비리를 사전에 차단하거나
                  즉시 적발할 수 있습니다.
                </p>
              </div>
              <div className="text-center md:col-span-4">
                <div className="font-serif text-6xl text-gold">0.01%</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  사업비 대비 감독 비용 비율
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRONG CTA ── */}
      <section className="relative overflow-hidden bg-ink py-24 text-primary-foreground md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.72_0.12_75/0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">
            지금 결정하지 않으면
          </div>
          <h2 className="mt-6 font-serif text-4xl leading-[1.1] md:text-6xl">
            귀 조합도<br />
            <span className="text-gold">위 명단의 일부</span>가 될 수 있습니다.
          </h2>
          <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
            위에서 확인한 {cases.length}건의 사례와 국토부 통계는 빙산의 일각입니다.
            적발되지 않는 비리까지 포함하면 실제 규모는 훨씬 큽니다.
            독립 회계사의 상시 감독 하나만으로 대부분의 비리는 사전에 차단됩니다.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 text-sm font-medium text-ink hover:opacity-90"
            >
              지금 상담 신청 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contract"
              className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 px-8 py-4 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              월 수수료 안내
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
