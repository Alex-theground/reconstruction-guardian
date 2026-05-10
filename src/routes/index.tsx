import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { YouTubeModal } from "@/components/YouTubeModal";
import heroImg from "@/assets/hero-construction.jpg";
import { ShieldCheck, FileSearch, Scale, TrendingDown, ArrowRight, Play, AlertTriangle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "정감 회계 — 재건축 조합 회계 감독 파트너" },
      {
        name: "description",
        content:
          "재건축·재개발 조합의 회계 부정과 자금 집행 위험으로부터 조합원을 보호합니다. 독립 공인회계사의 월정 감독 서비스.",
      },
      { property: "og:title", content: "정감 회계 — 재건축 조합 회계 감독 파트너" },
      {
        property: "og:description",
        content: "조합 운영을 감독하는 독립 회계사. 조합원의 자산을 지키는 월정 프리랜서 감독 계약.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  return (
    <PageShell>
      <YouTubeModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImg}
          alt="재건축 현장"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-48">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-ink/40 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-gold backdrop-blur">
              <span className="h-1 w-1 rounded-full bg-gold" /> 독립 회계 감독
            </div>
            <h1 className="mt-8 font-serif text-5xl leading-[1.05] text-primary-foreground md:text-7xl">
              조합 운영을 감독하는<br />
              <span className="text-gold">단 한 명의 회계사.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-primary-foreground/80">
              재건축·재개발 조합 운영 과정에서 발생할 수 있는 회계 부정·자금 집행 리스크로부터 조합원의 자산을 지킵니다.
              월정 보수의 프리랜서 계약으로, 조합 내부에 독립적인 감독 회계사를 두십시오.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/contract"
                className="inline-flex items-center gap-2 rounded-sm bg-gold px-7 py-4 text-sm font-medium text-ink transition-all hover:opacity-90"
              >
                계약 조건 보기 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-sm border border-primary-foreground/30 px-7 py-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-foreground/10"
              >
                서비스 상세
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="border-b border-border bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="text-xs uppercase tracking-[0.3em] text-gold">
                문제의식
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                조합이 무너지면<br />조합원이 무너집니다.
              </h2>
            </div>
            <div className="space-y-8 md:col-span-7">
              <p className="text-lg leading-relaxed text-foreground/80">
                대한민국의 재건축·재개발 조합 운영 과정에서는 회계 부정, 이중 계약,
                무리한 자금 집행, 그리고 조합 파산으로 인한 조합원 개인의 막대한
                손실이 끊임없이 반복되고 있습니다.
              </p>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { v: "62%", l: "조합 분쟁 비율" },
                  { v: "3.4억", l: "조합원 평균 추가 분담금" },
                  { v: "11년", l: "평균 사업 지연" },
                ].map((s) => (
                  <div key={s.l} className="border-t border-foreground/20 pt-4">
                    <div className="font-serif text-3xl text-foreground">{s.v}</div>
                    <div className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                * 국토교통부 및 주요 언론 보도 기반의 일반적 추정치이며, 사업장에 따라 상이합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EVIDENCE — Real cases & broadcasts */}
      <section className="border-b border-border bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold">
                <AlertTriangle className="h-3.5 w-3.5" /> Real Evidence
              </div>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                이건 추측이 아닙니다.<br />
                <span className="text-foreground/40">국토부 통계로 확인된, </span>
                <span>반복되는 구조적 문제입니다.</span>
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-foreground/70 leading-relaxed">
                국토교통부 현장조사에 따르면 재건축·재개발 비리 적발은 <strong>5년 새
                2배</strong>로 증가, 수사 의뢰는 <strong>100건을 초과</strong>했습니다.
                지상파 탐사보도 누적 조회수 500만 이상. 그럼에도 대부분의 조합은
                여전히 독립적인 회계 감독 없이 운영되고 있습니다.
              </p>
            </div>
          </div>

          {/* Key stats bar */}
          <div className="mt-16 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-4">
            {[
              { v: "2배", l: "5년간 비리 적발 증가율", s: "국토교통부" },
              { v: "100건+", l: "검찰·경찰 수사 의뢰 누적", s: "노컷뉴스 (2024)" },
              { v: "209억", l: "단일 조합 최대 편취 금액", s: "동아일보 (2025)" },
              { v: "12억원", l: "조합원 1인당 추가 분담금", s: "땅집고 (2024)" },
            ].map((s) => (
              <div key={s.l} className="bg-card p-8">
                <div className="font-serif text-4xl text-gold">{s.v}</div>
                <div className="mt-2 text-sm font-medium text-foreground/80">{s.l}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{s.s}</div>
              </div>
            ))}
          </div>

          {/* Featured cases */}
          <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-border bg-border md:grid-cols-3">
            {[
              {
                tag: "뇌물·구속",
                title: "임대아파트 사업권 — 8억 뇌물, 9명 구속",
                desc: "사업자 선정 대가로 8억 원의 뇌물이 거래되어 조합장 등 9명이 구속.",
                src: "프레시안 (2025)",
                url: "https://www.pressian.com/pages/articles/2025042913451483296",
              },
              {
                tag: "공사비 부풀리기",
                title: "용인 조합 — 13억 뒷돈, 공사비 385억 증액",
                desc: "뒷돈 수수 후 공사비 385억 부당 증액. 전직 시장·국회의원까지 연루.",
                src: "헤럴드경제 (2025)",
                url: "https://heraldk.com/2025/07/30/13%ec%96%b5-%eb%92%b7%eb%8f%88-%eb%b0%9b%ea%b3%a0-%ea%b3%b5%ec%82%ac%eb%b9%84-385%ec%96%b5-%ec%a6%9d%ec%95%a1%e2%80%a6%ec%a0%84-%ec%a3%bc%ed%83%9d%ec%a1%b0%ed%95%a9%ec%9e%a5-%ea%b5%ac%ec%86%8d/",
              },
              {
                tag: "대규모 사기",
                title: "은평 조합 — 428명에게서 209억 편취",
                desc: "허위 광고로 모집한 428명의 계약금 209억 편취. 대표 징역 20년 선고.",
                src: "동아일보 (2025)",
                url: "https://www.donga.com/news/Society/article/all/20250129/130938050/1",
              },
            ].map((c) => (
              <a
                key={c.title}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group bg-card p-8 transition-colors hover:bg-parchment"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3 w-3" />
                  {c.tag}
                </span>
                <h3 className="mt-6 font-serif text-xl leading-snug transition-colors group-hover:text-gold">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{c.desc}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>{c.src}</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            ))}
          </div>

          {/* Broadcasts */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              { id: "awAUbL2xjHU", t: "삼성 재건축 비리 의혹 — MBC 스트레이트", v: "73.7만 조회" },
              { id: "fLv2b9zXzkc", t: "투기와의 전쟁, 왜 실패했나 — MBC 스트레이트", v: "174.8만 조회" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveVideo(b.id)}
                className="group relative flex items-center gap-5 overflow-hidden rounded-sm border border-border bg-card p-3 pr-6 text-left transition-all hover:shadow-elegant"
              >
                <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded-sm bg-ink">
                  <img
                    src={`https://i.ytimg.com/vi/${b.id}/hqdefault.jpg`}
                    alt={b.t}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-ink">
                      <Play className="h-4 w-4 fill-ink translate-x-0.5" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs uppercase tracking-wider text-gold">방송 보도</div>
                  <div className="mt-2 font-serif text-base leading-snug">{b.t}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{b.v} · 클릭해서 재생</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/cases"
              className="inline-flex items-center gap-2 rounded-sm bg-ink px-7 py-4 text-sm font-medium text-primary-foreground hover:bg-ink/90"
            >
              12건의 사례·4개 방송 모두 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-8 border-b border-border pb-8">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-gold">핵심 역할</div>
              <h2 className="mt-4 font-serif text-4xl md:text-5xl">두 가지 감독 영역</h2>
            </div>
            <Link
              to="/services"
              className="hidden items-center gap-2 text-sm text-foreground/70 hover:text-foreground md:inline-flex"
            >
              전체 서비스 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-sm bg-border md:grid-cols-2">
            {[
              {
                icon: FileSearch,
                num: "01",
                title: "회계·지출의 세부 검토",
                desc: "조합의 모든 회계 처리와 지출 항목에 대해 독립적 회계사의 관점에서 적정성을 검증합니다. 시공사·협력업체 계약, 정산서, 영수증, 회계장부의 일치 여부를 정기적으로 감사합니다.",
                points: ["월별 지출 검토", "계약 단가 적정성 분석", "회계장부 정합성 점검"],
              },
              {
                icon: Scale,
                num: "02",
                title: "조합 운영·자금집행 검증",
                desc: "조합의 자금집행 결정 전반에 대해 세무적·법적 타당성을 사전·사후로 검증합니다. 잘못된 결정이 실행되기 전에 경고하고, 조합원에게 객관적 의견을 제시합니다.",
                points: ["자금집행 사전 검토", "세무 리스크 분석", "조합원 보고서 작성"],
              },
            ].map((s) => (
              <div key={s.num} className="bg-card p-10 md:p-14">
                <div className="flex items-start justify-between">
                  <s.icon className="h-10 w-10 text-gold" strokeWidth={1.2} />
                  <span className="font-serif text-5xl text-foreground/15">{s.num}</span>
                </div>
                <h3 className="mt-8 font-serif text-2xl">{s.title}</h3>
                <p className="mt-4 text-foreground/70 leading-relaxed">{s.desc}</p>
                <ul className="mt-8 space-y-3 border-t border-border pt-6">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm">
                      <span className="h-px w-6 bg-gold" />
                      <span className="text-foreground/80">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-ink py-24 text-primary-foreground md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">차별점</div>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            왜 외부 감사가 아닌,<br />
            <span className="text-gold">상주 감독 회계사</span>인가?
          </h2>

          <div className="mt-20 grid gap-12 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                t: "독립성",
                d: "조합 내부 직원이 아닌 외부 공인회계사로서 어떠한 이해관계도 없이 독립적인 판단을 내립니다.",
              },
              {
                icon: TrendingDown,
                t: "사전 예방",
                d: "결산 후 발견되는 사후 감사가 아닌, 자금 집행 전 검토를 통해 손실을 미리 차단합니다.",
              },
              {
                icon: Scale,
                t: "지속성",
                d: "단발성 컨설팅이 아닌 월정 계약을 통해 사업 전 기간에 걸친 일관된 감독을 제공합니다.",
              },
            ].map((b) => (
              <div key={b.t} className="border-t border-primary-foreground/15 pt-8">
                <b.icon className="h-8 w-8 text-gold" strokeWidth={1.2} />
                <h3 className="mt-6 font-serif text-2xl">{b.t}</h3>
                <p className="mt-4 leading-relaxed text-primary-foreground/70">{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* SIMULATOR CTA */}
      <section className="border-b border-border bg-card py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Risk Simulator</div>
          <h2 className="mt-6 font-serif text-3xl leading-tight md:text-4xl">
            우리 조합의 잠재 피해액은 얼마일까?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            사업비와 세대 수를 입력하면, 사업 초기·중기·완료 단계별 예상 리스크와 손실액을 즉시 계산합니다.
          </p>
          <Link
            to="/simulator"
            className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gold px-8 py-4 text-sm font-medium text-ink hover:opacity-90"
          >
            손실 시뮬레이터 시작하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-parchment py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">계약 제안</div>
          <h2 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
            귀 조합의 자산을 지키는<br />첫걸음을 시작하십시오.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground">
            합리적인 월정 수수료로 조합 운영의 투명성을 확보할 수 있습니다.
            상담 후 사업 규모에 맞는 맞춤 제안서를 보내드립니다.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-sm bg-ink px-8 py-4 text-sm font-medium text-primary-foreground hover:bg-ink/90"
            >
              상담 신청하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contract"
              className="inline-flex items-center gap-2 rounded-sm border border-foreground/20 px-8 py-4 text-sm font-medium hover:bg-foreground/5"
            >
              계약 조건 보기
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
