import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { YouTubeModal } from "@/components/YouTubeModal";
import { ExternalLink, Play, AlertTriangle, Newspaper, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "왜 필요한가 — 실제 사례 · 정감 회계" },
      {
        name: "description",
        content:
          "가락시영 뇌물 비리, 신반포 12억 분담금 폭탄, 포항 두호주공 파산까지. 재건축 조합 비리·파산의 실제 보도와 방송 사례.",
      },
      { property: "og:title", content: "왜 회계 감독이 필요한가 — 실제 사례" },
      {
        property: "og:description",
        content: "조합 비리는 예외가 아니라 패턴입니다. 실제 방송과 보도가 증명합니다.",
      },
    ],
  }),
  component: CasesPage,
});

const cases = [
  {
    tag: "뇌물·로비",
    headline: "국내 최대 가락시영 재건축 — 조합장 등 7명 기소",
    summary:
      "9개월에 걸친 검찰 수사 결과, 시공사·용역업체 선정 대가로 수억 원의 뇌물이 오간 사실이 확인되었습니다. 조합장들은 입찰 정보를 미리 흘리거나 ‘잘 봐달라’는 청탁을 받았습니다.",
    source: "국민일보 / 헤럴드경제",
    url: "https://www.kmib.co.kr/article/view.asp?arcid=0011091815",
    impact: "수만 세대 사업장에서 발생한 조직적 부패",
  },
  {
    tag: "회계 부정 적발",
    headline: "강남 재건축조합 — 회계·용역 등 부정 사례 124건 적발",
    summary:
      "서울시 실태조사 결과 강남권 주요 재건축 조합에서만 회계 처리 오류, 부적정 용역 계약 등 124건의 부정·부적정 사례가 한 번에 적발되었습니다.",
    source: "뉴스핌",
    url: "https://www.newspim.com/news/view/20170216000110",
    impact: "단 한 차례 조사로 124건 — 일상화된 부정",
  },
  {
    tag: "파산",
    headline: "포항 두호주공아파트 재건축조합 — 파산 절차 돌입",
    summary:
      "사업이 좌초되며 조합 자체가 파산. 조합원들은 그동안 납입한 자금을 회수하지 못한 채 추가 분담금까지 떠안게 되는 최악의 상황에 직면했습니다.",
    source: "영남경제",
    url: "https://www.ynenews.kr/news/articleView.html?idxno=51111",
    impact: "조합원 개인 자산의 직접적 손실",
  },
  {
    tag: "분담금 폭탄",
    headline: "신반포 재건축 — 평수 줄여도 추가 분담금 12억 원",
    summary:
      "1:1 재건축임에도 불구하고 평수를 줄이는 조건에서조차 가구당 10억 원이 넘는 추가 분담금이 통보되었습니다. 사업비 관리·검증의 부재가 직접적 원인으로 지목됩니다.",
    source: "조선일보 땅집고",
    url: "https://realty.chosun.com/site/data/html_dir/2024/02/08/2024020801556.html",
    impact: "가구당 12억 원의 예측 불가능한 부담",
  },
  {
    tag: "장기 표류",
    headline: "조합 리스크에 정비사업 발목 — 11억 분담금 + 15년 표류",
    summary:
      "현행 정비사업은 개별 조합의 자율과 전문성에 크게 의존하는 구조. 조합이 한 번 오판하면 사업은 10년 이상 표류하고, 그 손실은 전부 조합원에게 전가됩니다.",
    source: "디지털타임스",
    url: "http://m.dt.co.kr/article/12051915",
    impact: "잘못된 의사결정 1건이 15년의 손실로",
  },
  {
    tag: "청산 분쟁",
    headline: "재개발 조합 청산 논란 — 1조 원 증발 위기",
    summary:
      "사업 완료 이후 청산 단계에서도 잔여 자금의 행방, 잉여금 분배, 추가 정산 등을 둘러싼 분쟁이 이어지며 조 단위 자금이 사라질 위기에 놓인 사례가 보고되고 있습니다.",
    source: "스페셜타임스",
    url: "https://www.specialtimes.co.kr/news/articleView.html?idxno=424210",
    impact: "준공 이후에도 끝나지 않는 회계 리스크",
  },
];

const broadcasts = [
  {
    title: "스트레이트 107회 — 삼성 재건축 비리 의혹 2탄",
    channel: "MBC 탐사기획 스트레이트",
    desc: "총회 없이 통과된 찬성표, 무혐의로 마무리된 검찰 수사. 재건축 조합 의사결정 구조의 구조적 허점을 파헤친 1시간 분량의 탐사 보도.",
    views: "73.7만 조회",
    duration: "1시간 13분",
    youtubeId: "awAUbL2xjHU",
  },
  {
    title: "스트레이트 102회 — 투기와의 전쟁, 왜 실패했나",
    channel: "MBC 탐사기획 스트레이트",
    desc: "재건축 단지 집주인의 66%가 실거주하지 않는 현실, 그리고 조합을 이용한 투기의 메커니즘을 추적한 174만 조회의 화제 방송.",
    views: "174.8만 조회",
    duration: "1시간 18분",
    youtubeId: "fLv2b9zXzkc",
  },
  {
    title: "스트레이트 98회 — 의원님들의 재건축 투자법",
    channel: "MBC 탐사기획 스트레이트",
    desc: "법안 통과 직전 매입, 73억 원이 올라도 ‘손해봤다’고 주장하는 재건축의 민낯. 243만 조회의 사회적 파장을 일으킨 방송.",
    views: "243.9만 조회",
    duration: "1시간 9분",
    youtubeId: "Bzk88vXq7ps",
  },
];

function CasesPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  return (
    <PageShell>
      <YouTubeModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
      <PageHero
        eyebrow="Why It Matters"
        title="조합 비리는 예외가 아니라 패턴입니다."
        description="아래는 모두 실제로 발생한 사건입니다. 단 한 번의 오판, 단 한 번의 묵인이 조합원 한 사람당 수억 원의 손실로 이어졌습니다. 지금 이 순간에도 같은 일이 반복되고 있습니다."
      />

      {/* IMPACT BANNER */}
      <section className="border-b border-border bg-ink py-20 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-4">
          {[
            { v: "124건", l: "강남 한 곳에서 적발된 회계 부정 (1회 조사)" },
            { v: "12억원", l: "신반포 조합원 1인당 추가 분담금" },
            { v: "1조원", l: "청산 분쟁으로 증발 위기에 놓인 자금" },
            { v: "15년", l: "조합 오판으로 인한 사업 평균 표류 기간" },
          ].map((s) => (
            <div key={s.l} className="border-t border-gold/40 pt-6">
              <div className="font-serif text-5xl text-gold">{s.v}</div>
              <div className="mt-3 text-sm leading-relaxed text-primary-foreground/75">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BROADCAST SECTION */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-8 border-b border-border pb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
                <Play className="h-3.5 w-3.5 fill-gold" /> Broadcast Evidence
              </div>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">
                지상파가 직접 다룬 조합 비리.
              </h2>
              <p className="mt-6 max-w-2xl text-foreground/70">
                MBC 탐사기획 스트레이트가 수년간 추적해온 재건축 조합 문제. 누적 조회수
                500만 이상이 이 문제의 심각성을 증명합니다.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {broadcasts.map((b) => (
              <article
                key={b.youtubeId}
                className="group overflow-hidden rounded-sm border border-border bg-card shadow-soft transition-all hover:shadow-elegant"
              >
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
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                    <span className="text-gold">{b.channel}</span>
                    <span>{b.views}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl leading-tight">{b.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">{b.desc}</p>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(b.youtubeId)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-gold"
                  >
                    여기서 바로 재생 <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CASE LIST */}
      <section className="border-t border-border bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
            <Newspaper className="h-3.5 w-3.5" /> Documented Cases
          </div>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">
            보도된 사실, 반복되는 패턴.
          </h2>
          <p className="mt-6 max-w-2xl text-foreground/70">
            아래 모든 사례는 검찰 수사·법원 판결·공식 보도자료로 확인된 실제 사건입니다.
            언론사 원문 링크를 직접 확인하실 수 있습니다.
          </p>

          <div className="mt-16 space-y-px overflow-hidden rounded-sm border border-border bg-border">
            {cases.map((c) => (
              <a
                key={c.headline}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group grid gap-6 bg-card p-8 transition-colors hover:bg-card/60 md:grid-cols-12 md:p-10"
              >
                <div className="md:col-span-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {c.tag}
                  </span>
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
        </div>
      </section>

      {/* STRONG CTA */}
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
            적발된 회계 부정은 빙산의 일각입니다. 외부 회계사의 상시 감독 하나만으로
            대부분의 비리는 사전에 차단됩니다. 월 수백만 원의 비용으로 수십·수백억 원의
            손실을 막을 수 있습니다.
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
