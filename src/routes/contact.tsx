import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageHero } from "@/components/PageShell";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { submitContactInquiry } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "문의 — 바른집행" },
      {
        name: "description",
        content: "재건축 조합 회계 감독 서비스 상담 신청. 24시간 내 회신.",
      },
      { property: "og:title", content: "문의 — 바른집행" },
      { property: "og:description", content: "상담 및 제안서 요청." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await submitContactInquiry({
        data: {
          orgName: String(form.get("orgName") || ""),
          contactName: String(form.get("contactName") || ""),
          position: String(form.get("position") || ""),
          phone: String(form.get("phone") || ""),
          email: String(form.get("email") || ""),
          stage: String(form.get("stage") || ""),
          households: String(form.get("households") || ""),
          message: String(form.get("message") || ""),
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="조합의 미래를 위한 첫 대화."
        description="상담은 무료이며, 신청 후 영업일 기준 1일 이내에 담당 회계사가 직접 연락드립니다."
      />

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 md:grid-cols-12">
            {/* Info */}
            <aside className="md:col-span-4">
              <div className="text-xs uppercase tracking-[0.3em] text-gold">연락처</div>
              <h2 className="mt-4 font-serif text-3xl">직접 연결되는 채널</h2>

              <ul className="mt-12 space-y-8">
                {[
                  { icon: Phone, k: "전화", v: "02-0000-0000", s: "평일 09:00 – 18:00" },
                  { icon: Mail, k: "이메일", v: "info@junggam.kr", s: "24시간 접수" },
                  { icon: MapPin, k: "사무소", v: "서울특별시 강남구 테헤란로", s: "방문 상담 가능 (사전 예약)" },
                ].map((c) => (
                  <li key={c.k} className="flex gap-4">
                    <c.icon className="h-5 w-5 flex-shrink-0 text-gold" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.k}</div>
                      <div className="mt-1 font-serif text-lg text-foreground">{c.v}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{c.s}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </aside>

            {/* Form */}
            <div className="md:col-span-8">
              <div className="rounded-sm border border-border bg-card p-8 shadow-soft md:p-12">
                {submitted ? (
                  <div className="py-16 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15">
                      <Send className="h-7 w-7 text-gold" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-8 font-serif text-3xl">상담 신청이 접수되었습니다.</h3>
                    <p className="mt-4 text-muted-foreground">
                      영업일 기준 1일 이내 담당 회계사가 직접 연락드립니다.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="font-serif text-2xl">상담 신청서</h3>

                    {error && (
                      <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field label="조합명 / 사업장명" required>
                        <input name="orgName" className={inputCls} required />
                      </Field>
                      <Field label="담당자 성함" required>
                        <input name="contactName" className={inputCls} required />
                      </Field>
                      <Field label="직책">
                        <input name="position" className={inputCls} placeholder="조합장 / 이사 / 조합원 등" />
                      </Field>
                      <Field label="연락처" required>
                        <input name="phone" className={inputCls} type="tel" required />
                      </Field>
                      <Field label="이메일" required>
                        <input name="email" className={inputCls} type="email" required />
                      </Field>
                      <Field label="사업 단계">
                        <select name="stage" className={inputCls} defaultValue="">
                          <option value="" disabled>선택</option>
                          <option>조합 설립 단계</option>
                          <option>시공자 선정</option>
                          <option>관리처분 인가</option>
                          <option>착공 / 공사 중</option>
                          <option>준공 / 청산</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="세대 규모">
                      <select name="households" className={inputCls} defaultValue="">
                        <option value="" disabled>선택</option>
                        <option>300세대 미만</option>
                        <option>300 ~ 1,500세대</option>
                        <option>1,500세대 이상</option>
                      </select>
                    </Field>

                    <Field label="상담 내용">
                      <textarea
                        name="message"
                        className={`${inputCls} min-h-32 resize-y`}
                        placeholder="현재 조합이 직면한 회계·자금 관련 이슈, 또는 알고 싶은 사항을 자유롭게 적어주세요."
                      />
                    </Field>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" required className="mt-0.5" />
                      <span>
                        제공된 정보는 상담 목적으로만 활용되며, 비밀유지 의무하에 안전하게 관리됩니다.
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-6 py-4 text-sm font-medium text-primary-foreground hover:bg-ink/90 disabled:opacity-50"
                    >
                      {submitting ? "전송 중..." : "상담 신청하기"} <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

const inputCls =
  "w-full rounded-sm border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-gold">*</span>}
      </span>
      {children}
    </label>
  );
}
