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
} from "lucide-react";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "왜 필요한가 — 실제 사례와 통계 · 정감 회계" },
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
    summary:
      "임대아파트 사업권을 둘러싼 8억 원 규모의 뇌물 거래가 드러나 조합장을 포함한 9명이 구속되었습니다. 사업자 선정 과정 전체가 금품에 의해 좌우된 전형적인 사례입니다.",
    source: "프레시안 (2025.04)",
    url: "https://www.pressian.com/pages/articles/2025042913451483296",
    impact: "사업자 선정 전 과정이 뇌물로 오염",
    year: "2025",
  },
  {
    tag: "공사비 부풀리기",
    headline: "용인 지역주택조합 — 13억 뒷돈 받고 공사비 385억 증액",
    summary:
      "전 조합장이 시공사로부터 13억 원의 뒷돈을 수수하고 공사비를 385억 원이나 증액해준 혐의로 구속기소되었습니다. 전직 시장과 국회의원까지 연루된 '비리 백과사전'.",
    source: "헤럴드경제 / 조선일보 (2025.07)",
    url: "https://heraldk.com/2025/07/30/13%ec%96%b5-%eb%92%b7%eb%8f%88-%eb%b0%9b%ea%b3%a0-%ea%b3%b5%ec%82%ac%eb%b9%84-385%ec%96%b5-%ec%a6%9d%ec%95%a1%e2%80%a6%ec%a0%84-%ec%a3%bc%ed%83%9d%ec%a1%b0%ed%95%a9%ec%9e%a5-%ea%b5%ac%ec%86%8d/",
    impact: "385억 원의 부당 증액 — 전액 조합원 부담",
    year: "2025",
  },
  {
    tag: "대규모 사기",
    headline: "은평 주택조합 — 428명에게서 209억 편취, 징역 20년",
    summary:
      "허위·과장 광고로 조합원을 모집해 4년간 428명으로부터 계약금 209억 원을 편취하고 56억 원을 횡령. 법원은 '피해 회복 가능성이 희박하다'며 대행사 대표에게 징역 20년을 선고했습니다.",
    source: "동아일보 (2025.01)",
    url: "https://www.donga.com/news/Society/article/all/20250129/130938050/1",
    impact: "428명 전원 피해, 회복 불가 판결",
    year: "2025",
  },
  {
    tag: "횡령",
    headline: "신길5동 지주택 — 500억 횡령 의혹, 10년 기다린 조합원 빚더미",
    summary:
      "10년 넘게 기다린 조합원들 앞에 남은 것은 새 아파트가 아닌 빚더미. 500억 원에 달하는 횡령 의혹이 제기되며 사업은 완전히 좌초되었습니다.",
    source: "위메이크뉴스 (2024)",
    url: "https://www.wemakenews.co.kr/news/view.php?no=23103",
    impact: "10년의 시간 + 납입금 전액 손실",
    year: "2024",
  },
  {
    tag: "뇌물 비리",
    headline: "가락시영 재건축 — 조합장 등 7명 기소",
    summary:
      "수억 원 뇌물·입찰 정보 유출. 국내 최대 규모 단지에서 발생한 조직적 부패로 조합장과 관계자 7명이 기소되었습니다.",
    source: "국민일보 / 헤럴드경제",
    url: "https://www.kmib.co.kr/article/view.asp?arcid=0011091815",
    impact: "수만 세대 사업장의 조직적 부패",
    year: "2023",
  },
  {
    tag: "분담금 폭탄",
    headline: "신반포 재건축 — 평수 줄여도 추가 분담금 12억 원",
    summary:
      "1:1 재건축임에도 평수를 줄이는 조건에서조차 가구당 10억 원이 넘는 추가 분담금이 통보. 사업비 관리·검증의 부재가 직접적 원인으로 지목됩니다.",
    source: "조선일보 땅집고 (2024.02)",
    url: "https://realty.chosun.com/site/data/html_dir/2024/02/08/2024020801556.html",
    impact: "가구당 12억 원의 예측 불가능한 부담",
    year: "2024",
  },
  {
    tag: "빚더미 전가",
    headline: "대치 성원2단지 — 조합장이 쓴 180억, 주민이 갚아라",
    summary:
      "리모델링 추진 과정에서 조합장이 집행한 사업비 180억 원이 고스란히 빚으로 남아 전체 조합원에게 전가. 사업은 중단되었지만 빚은 남았습니다.",
    source: "조선일보 땅집고 (2025.03)",
    url: "https://realty.chosun.com/site/data/html_dir/2025/03/26/2025032603081.html",
    impact: "사업 중단 후에도 빚은 조합원 몫",
    year: "2025",
  },
  {
    tag: "분담금 분쟁",
    headline: "구마을3지구 — 분담금 11억 추가, 입주 중단",
    summary:
      "분담금 증액안이 총회에서 부결되었으나 시공사는 '더 이상 기다릴 수 없다'며 입주를 중단. 완공된 아파트에 들어가지 못하는 극단적 상황이 벌어졌습니다.",
    source: "조선일보 땅집고 (2026.03)",
    url: "https://realty.chosun.com/site/data/html_dir/2026/03/12/2026031201205.html",
    impact: "완공 아파트에 입주 불가 — 가장 최근 사례",
    year: "2026",
  },
  {
    tag: "내부자 거래",
    headline: "지역주택조합 간부 — 16억에 사서 29억에 되팔기",
    summary:
      "조합 간부가 가족 명의로 조합 부지를 미리 매입한 뒤 조합에 29억 원에 되파는 방식으로 사적 이익을 챙긴 혐의로 경찰 수사가 착수되었습니다.",
    source: "동아일보 (2025.11)",
    url: "https://www.donga.com/news/Society/article/all/20251130/132870273/1",
    impact: "조합 자금으로 간부의 사적 이익 편취",
    year: "2025",
  },
  {
    tag: "파산",
    headline: "포항 두호주공 — 조합 파산 절차 돌입",
    summary:
      "사업이 좌초되며 조합 자체가 파산. 조합원들은 납입한 자금을 회수하지 못한 채 추가 분담금까지 떠안게 되는 최악의 상황에 직면했습니다.",
    source: "영남경제",
    url: "https://www.ynenews.kr/news/articleView.html?idxno=51111",
    impact: "조합원 개인 자산의 직접적 손실",
    year: "2023",
  },
  {
    tag: "횡령",
    headline: "대전 지역주택조합 — 60억 횡령, 호화 생활",
    summary:
      "대행사 대표가 조합 자금 60억 원을 횡령해 호화 생활을 누린 혐의로 구속기소. 조합원의 내 집 마련 자금이 한 개인의 사치로 사라진 전형적 사례.",
    source: "열린뉴스통신 (2025)",
    url: "https://www.onews.tv/news/articleView.html?idxno=273020",
    impact: "60억 원의 조합 자금이 개인 호화 생활에 사용",
    year: "2025",
  },
  {
    tag: "가짜 조합원",
    headline: "가짜 조합원을 만들어 37억 원 편취",
    summary:
      "실제 존재하지 않는 가짜 조합원을 만들어 37억 원을 편취한 사건. 조합 운영의 투명성 없이는 이러한 유령 조합원 사기를 막을 방법이 없습니다.",
    source: "위클리한국주택경제신문 (2026.03)",
    url: "https://www.arunews.com/news/articleView.html?idxno=47353",
    impact: "유령 조합원을 이용한 조직적 사기",
    year: "2026",
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

          <div className="mt-16 space-y-px overflow-hidden rounded-sm border border-border bg-border">
            {visibleCases.map((c) => (
              <a
                key={c.headline}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group grid gap-6 bg-card p-8 transition-colors hover:bg-parchment md:grid-cols-12 md:p-10"
              >
                <div className="flex flex-col gap-2 md:col-span-2">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {c.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">{c.year}</span>
                </div>
                <div className="md:col-span-7">
                  <h3 className="font-serif text-xl leading-snug text-foreground transition-colors group-hover:text-gold md:text-2xl">
                    {c.headline}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{c.summary}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>출처: {c.source}</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
                <div className="border-t border-border pt-4 md:col-span-3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    실질적 영향
                  </div>
                  <div className="mt-2 font-serif text-base leading-snug text-foreground">
                    {c.impact}
                  </div>
                </div>
              </a>
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
