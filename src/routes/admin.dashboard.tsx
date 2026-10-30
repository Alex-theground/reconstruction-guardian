import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { defaultHomeExt, type HomeExtData, type ComparisonRow, type TrustPrinciple } from "@/lib/home-content";
import {
  Save, LogOut, Home, FileText, BarChart3, Wrench, GitBranch, CreditCard, MessageSquare,
  Plus, Trash2, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Film, Check, History, RotateCcw, Inbox
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "관리자 대시보드 — 바른집행" }] }),
  component: AdminDashboard,
});

/* ─── types ─── */
type Tab = "home" | "cases" | "simulator" | "services" | "process" | "contract" | "contact" | "broadcasts" | "inquiries";

interface TabDef { key: Tab; label: string; icon: typeof Home }

const tabs: TabDef[] = [
  { key: "home", label: "홈", icon: Home },
  { key: "cases", label: "사례/통계", icon: FileText },
  { key: "broadcasts", label: "방송 영상", icon: Film },
  { key: "simulator", label: "시뮬레이터", icon: BarChart3 },
  { key: "services", label: "서비스", icon: Wrench },
  { key: "process", label: "프로세스", icon: GitBranch },
  { key: "contract", label: "계약 안내", icon: CreditCard },
  { key: "contact", label: "문의 정보", icon: MessageSquare },
  { key: "inquiries", label: "상담 신청", icon: Inbox },
];

/* ─── helpers ─── */
const inputCls = "w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold";
const textareaCls = `${inputCls} min-h-[80px] resize-y`;
const btnPrimary = "inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-ink/90 disabled:opacity-50";
const btnDanger = "inline-flex items-center gap-2 rounded-sm bg-destructive/10 px-3 py-2 text-xs text-destructive hover:bg-destructive/20";
const btnSecondary = "inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs hover:bg-muted";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/* ─── main component ─── */
function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [contents, setContents] = useState<Record<string, unknown>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate({ to: "/admin" });
    }
  }, [loading, user, isAdmin, navigate]);

  // Load all content
  const loadContent = useCallback(async () => {
    const { data } = await supabase.from("site_content").select("section_key, content");
    const map: Record<string, unknown> = {};
    data?.forEach((r) => { map[r.section_key] = r.content; });
    setContents(map);
    setDataLoading(false);
  }, []);

  useEffect(() => { if (isAdmin) loadContent(); }, [isAdmin, loadContent]);

  const saveSection = async (key: string, content: unknown) => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert(
          { section_key: key, content: content as Json, updated_at: new Date().toISOString() },
          { onConflict: "section_key" }
        );
      if (error) throw error;
      setContents((prev) => ({ ...prev, [key]: content }));
      setSaveMsg({ type: "ok", text: "저장되었습니다." });
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg({ type: "err", text: err instanceof Error ? err.message : "저장 실패" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!user || !isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse font-serif text-xl text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-parchment">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink text-gold font-serif text-sm">바</div>
          <span className="text-sm font-medium">CMS 관리</span>
        </div>
        <nav className="p-3 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                activeTab === t.key ? "bg-ink text-primary-foreground" : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-4">
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-xs text-destructive hover:underline">
            <LogOut className="h-3 w-3" /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-8 py-4 backdrop-blur">
          <h1 className="font-serif text-xl">{tabs.find((t) => t.key === activeTab)?.label} 관리</h1>
          <div className="flex items-center gap-3">
            {saveMsg && (
              <span className={`flex items-center gap-1.5 text-xs ${saveMsg.type === "ok" ? "text-green-600" : "text-destructive"}`}>
                {saveMsg.type === "ok" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                {saveMsg.text}
              </span>
            )}
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              사이트 보기 →
            </Link>
          </div>
        </header>

        <div className="p-8">
          {dataLoading ? (
            <div className="animate-pulse text-muted-foreground">콘텐츠 불러오는 중...</div>
          ) : (
            <>
              {activeTab === "home" && <HomeEditor data={contents["home"] as any} onSave={(d) => saveSection("home", d)} saving={saving} />}
              {activeTab === "cases" && <CasesEditor data={contents["cases"] as any} onSave={(d) => saveSection("cases", d)} saving={saving} />}
              {activeTab === "broadcasts" && <BroadcastsEditor data={contents["broadcasts"] as any} onSave={(d) => saveSection("broadcasts", d)} saving={saving} />}
              {activeTab === "simulator" && <SimulatorEditor data={contents["simulator"] as any} onSave={(d) => saveSection("simulator", d)} saving={saving} />}
              {activeTab === "services" && <ServicesEditor data={contents["services"] as any} onSave={(d) => saveSection("services", d)} saving={saving} />}
              {activeTab === "process" && <ProcessEditor data={contents["process"] as any} onSave={(d) => saveSection("process", d)} saving={saving} />}
              {activeTab === "contract" && <ContractEditor data={contents["contract"] as any} onSave={(d) => saveSection("contract", d)} saving={saving} />}
              {activeTab === "contact" && <ContactEditor data={contents["contact"] as any} onSave={(d) => saveSection("contact", d)} saving={saving} />}
              {activeTab === "inquiries" && <InquiriesPanel />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── Section Editors ─── */
interface EditorProps<T> { data: T | null; onSave: (data: T) => void; saving: boolean }

function SaveBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="sticky bottom-0 mt-8 border-t border-border bg-card px-6 py-4">
      <button onClick={onSave} disabled={saving} className={btnPrimary}>
        <Save className="h-4 w-4" /> {saving ? "저장 중..." : "변경사항 저장"}
      </button>
    </div>
  );
}

/* ─ HOME ─ */
type HomeData = {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  stats: { value: string; label: string }[];
  problemTitle: string;
  problemDescription: string;
} & HomeExtData;

const defaultHome: HomeData = {
  heroTitle: "조합 운영을 감독하는",
  heroSubtitle: "조합원을 위한 회계사.",
  heroDescription: "재건축·재개발 조합의 비리와 회계 부정으로부터 조합원의 자산을 지킵니다.",
  stats: [
    { value: "62%", label: "조합 분쟁 비율" },
    { value: "3.4억", label: "조합원 평균 추가 분담금" },
    { value: "11년", label: "평균 사업 지연" },
  ],
  problemTitle: "조합이 무너지면 조합원이 무너집니다.",
  problemDescription: "대한민국의 재건축·재개발 조합 운영 과정에서는 회계 부정, 이중 계약, 무리한 자금 집행, 그리고 조합 파산으로 인한 조합원 개인의 막대한 손실이 끊임없이 반복되고 있습니다.",
  ...defaultHomeExt,
};

function HomeEditor({ data, onSave, saving }: EditorProps<HomeData>) {
  const merged: HomeData = { ...defaultHome, ...(data || {}),
    comparison: { ...defaultHome.comparison, ...(data?.comparison ?? {}),
      leftCard: { ...defaultHome.comparison.leftCard, ...(data?.comparison?.leftCard ?? {}) },
      rightCard: { ...defaultHome.comparison.rightCard, ...(data?.comparison?.rightCard ?? {}) },
      tableHeaders: { ...defaultHome.comparison.tableHeaders, ...(data?.comparison?.tableHeaders ?? {}) },
      rows: data?.comparison?.rows ?? defaultHome.comparison.rows,
    },
    trustPrinciples: data?.trustPrinciples ?? defaultHome.trustPrinciples,
    terminology: { ...defaultHome.terminology, ...(data?.terminology ?? {}) },
  };
  const [form, setForm] = useState<HomeData>(merged);
  const set = (key: keyof HomeData, value: unknown) => setForm((p) => ({ ...p, [key]: value }));
  const setCmp = (patch: Partial<HomeData["comparison"]>) =>
    setForm((p) => ({ ...p, comparison: { ...p.comparison, ...patch } }));
  const setLeft = (patch: Partial<HomeData["comparison"]["leftCard"]>) =>
    setForm((p) => ({ ...p, comparison: { ...p.comparison, leftCard: { ...p.comparison.leftCard, ...patch } } }));
  const setRight = (patch: Partial<HomeData["comparison"]["rightCard"]>) =>
    setForm((p) => ({ ...p, comparison: { ...p.comparison, rightCard: { ...p.comparison.rightCard, ...patch } } }));
  const setHeaders = (patch: Partial<HomeData["comparison"]["tableHeaders"]>) =>
    setForm((p) => ({ ...p, comparison: { ...p.comparison, tableHeaders: { ...p.comparison.tableHeaders, ...patch } } }));
  const setTerm = (patch: Partial<HomeData["terminology"]>) =>
    setForm((p) => ({ ...p, terminology: { ...p.terminology, ...patch } }));

  return (
    <div className="space-y-8">
      <Section title="히어로 섹션">
        <Field label="메인 타이틀"><input className={inputCls} value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} /></Field>
        <Field label="서브 타이틀 (강조)">
          <input className={inputCls} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {data?.heroSubtitle ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
                ● DB 저장값 사용 중
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                ● 기본값 사용 중 (DB 미저장)
              </span>
            )}
            <span className="text-muted-foreground">
              DB: <code className="rounded bg-muted px-1 py-0.5">{data?.heroSubtitle ?? "—"}</code>
            </span>
            <span className="text-muted-foreground">
              기본값: <code className="rounded bg-muted px-1 py-0.5">{defaultHome.heroSubtitle}</code>
            </span>
          </div>
        </Field>
        <Field label="설명"><textarea className={textareaCls} value={form.heroDescription} onChange={(e) => set("heroDescription", e.target.value)} /></Field>
      </Section>
      <Section title="핵심 통계">
        <ListEditor
          items={form.stats}
          onChange={(stats) => set("stats", stats)}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="수치"><input className={inputCls} value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} /></Field>
              <Field label="설명"><input className={inputCls} value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ value: "", label: "" })}
        />
      </Section>
      <Section title="문제의식 섹션">
        <Field label="제목"><input className={inputCls} value={form.problemTitle} onChange={(e) => set("problemTitle", e.target.value)} /></Field>
        <Field label="설명"><textarea className={textareaCls} value={form.problemDescription} onChange={(e) => set("problemDescription", e.target.value)} /></Field>
      </Section>

      <Section title="회계감사 비교 — 헤더">
        <Field label="태그(상단 라벨)"><input className={inputCls} value={form.comparison.tag} onChange={(e) => setCmp({ tag: e.target.value })} /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="제목 1행"><input className={inputCls} value={form.comparison.headingLine1} onChange={(e) => setCmp({ headingLine1: e.target.value })} /></Field>
          <Field label="제목 2행 (흐림)"><input className={inputCls} value={form.comparison.headingLine2Muted} onChange={(e) => setCmp({ headingLine2Muted: e.target.value })} /></Field>
          <Field label="제목 3행"><input className={inputCls} value={form.comparison.headingLine3} onChange={(e) => setCmp({ headingLine3: e.target.value })} /></Field>
        </div>
        <Field label="설명"><textarea className={textareaCls} value={form.comparison.intro} onChange={(e) => setCmp({ intro: e.target.value })} /></Field>
        <Field label="하단 주석"><textarea className={textareaCls} value={form.comparison.footnote} onChange={(e) => setCmp({ footnote: e.target.value })} /></Field>
      </Section>

      <Section title="비교 — 왼쪽 카드 (일반 회계감사)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="태그"><input className={inputCls} value={form.comparison.leftCard.tag} onChange={(e) => setLeft({ tag: e.target.value })} /></Field>
          <Field label="제목"><input className={inputCls} value={form.comparison.leftCard.title} onChange={(e) => setLeft({ title: e.target.value })} /></Field>
        </div>
        <Field label="설명"><textarea className={textareaCls} value={form.comparison.leftCard.desc} onChange={(e) => setLeft({ desc: e.target.value })} /></Field>
        <Field label="포인트 (한 줄에 하나씩)">
          <textarea
            className={`${textareaCls} min-h-[120px]`}
            value={form.comparison.leftCard.points.join("\n")}
            onChange={(e) => setLeft({ points: e.target.value.split("\n").filter(Boolean) })}
          />
        </Field>
      </Section>

      <Section title="비교 — 오른쪽 카드 (바른집행 감독)">
        <div className="grid grid-cols-3 gap-3">
          <Field label="뱃지"><input className={inputCls} value={form.comparison.rightCard.badge} onChange={(e) => setRight({ badge: e.target.value })} /></Field>
          <Field label="태그"><input className={inputCls} value={form.comparison.rightCard.tag} onChange={(e) => setRight({ tag: e.target.value })} /></Field>
          <Field label="제목"><input className={inputCls} value={form.comparison.rightCard.title} onChange={(e) => setRight({ title: e.target.value })} /></Field>
        </div>
        <Field label="설명"><textarea className={textareaCls} value={form.comparison.rightCard.desc} onChange={(e) => setRight({ desc: e.target.value })} /></Field>
        <Field label="포인트 (한 줄에 하나씩)">
          <textarea
            className={`${textareaCls} min-h-[120px]`}
            value={form.comparison.rightCard.points.join("\n")}
            onChange={(e) => setRight({ points: e.target.value.split("\n").filter(Boolean) })}
          />
        </Field>
      </Section>

      <Section title="비교표">
        <div className="grid grid-cols-3 gap-3">
          <Field label="열 1 헤더"><input className={inputCls} value={form.comparison.tableHeaders.criterion} onChange={(e) => setHeaders({ criterion: e.target.value })} /></Field>
          <Field label="열 2 헤더"><input className={inputCls} value={form.comparison.tableHeaders.audit} onChange={(e) => setHeaders({ audit: e.target.value })} /></Field>
          <Field label="열 3 헤더"><input className={inputCls} value={form.comparison.tableHeaders.ours} onChange={(e) => setHeaders({ ours: e.target.value })} /></Field>
        </div>
        <ListEditor<ComparisonRow>
          items={form.comparison.rows}
          onChange={(rows) => setCmp({ rows })}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-3 gap-3">
              <Field label="기준"><input className={inputCls} value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} /></Field>
              <Field label="회계감사"><input className={inputCls} value={item.audit} onChange={(e) => update({ ...item, audit: e.target.value })} /></Field>
              <Field label="바른집행"><input className={inputCls} value={item.ours} onChange={(e) => update({ ...item, ours: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ label: "", audit: "", ours: "" })}
        />
      </Section>

      <Section title="신뢰의 기준 (메인 + 푸터 공용)">
        <Field label="섹션 라벨"><input className={inputCls} value={form.trustPrinciples.tag} onChange={(e) => setForm((p) => ({ ...p, trustPrinciples: { ...p.trustPrinciples, tag: e.target.value } }))} /></Field>
        <ListEditor<TrustPrinciple>
          items={form.trustPrinciples.items}
          onChange={(items) => setForm((p) => ({ ...p, trustPrinciples: { ...p.trustPrinciples, items } }))}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="제목"><input className={inputCls} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} /></Field>
              <Field label="설명"><input className={inputCls} value={item.desc} onChange={(e) => update({ ...item, desc: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ title: "", desc: "" })}
        />
      </Section>

      <Section title="용어 / 푸터 문구">
        <div className="grid grid-cols-2 gap-3">
          <Field label="외부 감시자 명칭"><input className={inputCls} value={form.terminology.externalWatcher} onChange={(e) => setTerm({ externalWatcher: e.target.value })} /></Field>
          <Field label="독립적인 감시자 명칭"><input className={inputCls} value={form.terminology.independentWatcher} onChange={(e) => setTerm({ independentWatcher: e.target.value })} /></Field>
        </div>
        <Field label="푸터 소개 문구"><textarea className={textareaCls} value={form.terminology.footerDescription} onChange={(e) => setTerm({ footerDescription: e.target.value })} /></Field>
      </Section>

      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}


/* ─ CASES ─ */
interface CaseItem { tag: string; headline: string; year: string; source: string; url: string; impact: string }
interface CasesData {
  keyStats: { value: string; label: string; detail: string; source: string }[];
  cases: CaseItem[];
}

const defaultCases: CasesData = { keyStats: [], cases: [] };

function CasesEditor({ data, onSave, saving }: EditorProps<CasesData>) {
  const [form, setForm] = useState<CasesData>(data || defaultCases);
  return (
    <div className="space-y-8">
      <Section title="핵심 통계">
        <ListEditor
          items={form.keyStats}
          onChange={(keyStats) => setForm((p) => ({ ...p, keyStats }))}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="수치"><input className={inputCls} value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} /></Field>
              <Field label="제목"><input className={inputCls} value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} /></Field>
              <Field label="상세"><input className={inputCls} value={item.detail} onChange={(e) => update({ ...item, detail: e.target.value })} /></Field>
              <Field label="출처"><input className={inputCls} value={item.source} onChange={(e) => update({ ...item, source: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ value: "", label: "", detail: "", source: "" })}
        />
      </Section>
      <Section title="사례 목록">
        <ListEditor
          items={form.cases}
          onChange={(cases) => setForm((p) => ({ ...p, cases }))}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="태그"><input className={inputCls} value={item.tag} onChange={(e) => update({ ...item, tag: e.target.value })} /></Field>
              <Field label="연도"><input className={inputCls} value={item.year} onChange={(e) => update({ ...item, year: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="헤드라인"><input className={inputCls} value={item.headline} onChange={(e) => update({ ...item, headline: e.target.value })} /></Field></div>
              <Field label="출처"><input className={inputCls} value={item.source} onChange={(e) => update({ ...item, source: e.target.value })} /></Field>
              <Field label="URL"><input className={inputCls} value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="영향"><input className={inputCls} value={item.impact} onChange={(e) => update({ ...item, impact: e.target.value })} /></Field></div>
            </div>
          )}
          newItem={() => ({ tag: "", headline: "", year: "", source: "", url: "", impact: "" })}
        />
      </Section>
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─ BROADCASTS ─ */
interface BroadcastItem { title: string; channel: string; desc: string; views: string; duration: string; youtubeId: string }
interface BroadcastsData { broadcasts: BroadcastItem[] }

const defaultBroadcasts: BroadcastsData = { broadcasts: [] };

function BroadcastsEditor({ data, onSave, saving }: EditorProps<BroadcastsData>) {
  const [form, setForm] = useState<BroadcastsData>(data || defaultBroadcasts);
  return (
    <div className="space-y-8">
      <Section title="방송 영상 목록">
        <ListEditor
          items={form.broadcasts}
          onChange={(broadcasts) => setForm({ broadcasts })}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Field label="제목"><input className={inputCls} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} /></Field></div>
              <Field label="채널"><input className={inputCls} value={item.channel} onChange={(e) => update({ ...item, channel: e.target.value })} /></Field>
              <Field label="YouTube ID"><input className={inputCls} value={item.youtubeId} onChange={(e) => update({ ...item, youtubeId: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="설명"><textarea className={textareaCls} value={item.desc} onChange={(e) => update({ ...item, desc: e.target.value })} /></Field></div>
              <Field label="조회수"><input className={inputCls} value={item.views} onChange={(e) => update({ ...item, views: e.target.value })} /></Field>
              <Field label="재생 시간"><input className={inputCls} value={item.duration} onChange={(e) => update({ ...item, duration: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ title: "", channel: "", desc: "", views: "", duration: "", youtubeId: "" })}
        />
      </Section>
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─ SIMULATOR ─ */
interface RiskItem { name: string; probability: number; lossRate: number; description: string }
interface PhaseConfig { label: string; risks: RiskItem[] }
interface SimulatorData {
  phases: Record<string, PhaseConfig>;
  monthlyFeeRate?: number;
  minMonthlyFee?: number;
  contractYears?: number;
  riskReductionRate?: number;
}

const defaultSimulator: SimulatorData = {
  phases: {},
  monthlyFeeRate: 0.00008,
  minMonthlyFee: 0.03,
  contractYears: 5,
  riskReductionRate: 0.7,
};

function SimulatorEditor({ data, onSave, saving }: EditorProps<SimulatorData>) {
  const [form, setForm] = useState<SimulatorData>({ ...defaultSimulator, ...(data || {}) });
  const phases = ["initial", "mid", "completion"] as const;
  const phaseLabels: Record<string, string> = { initial: "사업 초기", mid: "사업 중기", completion: "사업 완료기" };

  return (
    <div className="space-y-8">
      <Section title="감독비 및 효과 설정 (시뮬레이터 계산식)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="월 감독비 비율 (사업비 대비, 예: 0.00008 = 0.008%)">
            <input type="number" step="0.00001" className={inputCls}
              value={form.monthlyFeeRate ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, monthlyFeeRate: +e.target.value }))} />
          </Field>
          <Field label="최소 월 감독비 (억 원, 예: 0.03 = 300만원)">
            <input type="number" step="0.001" className={inputCls}
              value={form.minMonthlyFee ?? 0}
              onChange={(e) => setForm((p) => ({ ...p, minMonthlyFee: +e.target.value }))} />
          </Field>
          <Field label="계약 기간 (년, 총 비용 산정)">
            <input type="number" className={inputCls}
              value={form.contractYears ?? 5}
              onChange={(e) => setForm((p) => ({ ...p, contractYears: +e.target.value }))} />
          </Field>
          <Field label="감독 시 리스크 저감율 (0~1, 예: 0.7 = 70% 저감)">
            <input type="number" step="0.05" min="0" max="1" className={inputCls}
              value={form.riskReductionRate ?? 0.7}
              onChange={(e) => setForm((p) => ({ ...p, riskReductionRate: +e.target.value }))} />
          </Field>
        </div>
      </Section>
      {phases.map((phase) => {
        const p = form.phases[phase] || { label: phaseLabels[phase], risks: [] };
        return (
          <Section key={phase} title={`${phaseLabels[phase]} 리스크`}>
            <Field label="단계 표시명">
              <input className={inputCls} value={p.label}
                onChange={(e) => setForm((prev) => ({
                  ...prev,
                  phases: { ...prev.phases, [phase]: { ...p, label: e.target.value } }
                }))} />
            </Field>
            <ListEditor
              items={p.risks}
              onChange={(risks) => setForm((prev) => ({
                ...prev,
                phases: { ...prev.phases, [phase]: { ...p, risks } }
              }))}
              renderItem={(item, i, update) => (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="리스크명"><input className={inputCls} value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} /></Field>
                  <Field label="설명"><input className={inputCls} value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} /></Field>
                  <Field label="발생확률 (%)"><input type="number" className={inputCls} value={item.probability} onChange={(e) => update({ ...item, probability: +e.target.value })} /></Field>
                  <Field label="손실비율 (%)"><input type="number" className={inputCls} value={item.lossRate} onChange={(e) => update({ ...item, lossRate: +e.target.value })} /></Field>
                </div>
              )}
              newItem={() => ({ name: "", probability: 0, lossRate: 0, description: "" })}
            />
          </Section>
        );
      })}
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─ SERVICES ─ */
interface ServiceItem { num: string; title: string; summary: string; items: string[] }
interface ServicesData { services: ServiceItem[]; transparencyTitle: string; transparencyDescription: string }

const defaultServices: ServicesData = { services: [], transparencyTitle: "", transparencyDescription: "" };

function ServicesEditor({ data, onSave, saving }: EditorProps<ServicesData>) {
  const [form, setForm] = useState<ServicesData>(data || defaultServices);
  return (
    <div className="space-y-8">
      <Section title="서비스 항목">
        <ListEditor
          items={form.services}
          onChange={(services) => setForm((p) => ({ ...p, services }))}
          renderItem={(item, i, update) => (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="번호"><input className={inputCls} value={item.num} onChange={(e) => update({ ...item, num: e.target.value })} /></Field>
                <Field label="제목"><input className={inputCls} value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} /></Field>
              </div>
              <Field label="요약"><textarea className={textareaCls} value={item.summary} onChange={(e) => update({ ...item, summary: e.target.value })} /></Field>
              <Field label="세부 항목 (줄바꿈으로 구분)">
                <textarea
                  className={textareaCls}
                  value={item.items.join("\n")}
                  onChange={(e) => update({ ...item, items: e.target.value.split("\n").filter(Boolean) })}
                />
              </Field>
            </div>
          )}
          newItem={() => ({ num: "", title: "", summary: "", items: [] })}
        />
      </Section>
      <Section title="투명성 섹션">
        <Field label="제목"><input className={inputCls} value={form.transparencyTitle} onChange={(e) => setForm((p) => ({ ...p, transparencyTitle: e.target.value }))} /></Field>
        <Field label="설명"><textarea className={textareaCls} value={form.transparencyDescription} onChange={(e) => setForm((p) => ({ ...p, transparencyDescription: e.target.value }))} /></Field>
      </Section>
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─ PROCESS ─ */
interface StepItem { n: string; t: string; d: string; when: string }
interface ProcessData { steps: StepItem[]; emergencyTitle: string; emergencyDescription: string }

const defaultProcess: ProcessData = { steps: [], emergencyTitle: "", emergencyDescription: "" };

function ProcessEditor({ data, onSave, saving }: EditorProps<ProcessData>) {
  const [form, setForm] = useState<ProcessData>(data || defaultProcess);
  return (
    <div className="space-y-8">
      <Section title="프로세스 단계">
        <ListEditor
          items={form.steps}
          onChange={(steps) => setForm((p) => ({ ...p, steps }))}
          renderItem={(item, i, update) => (
            <div className="grid grid-cols-2 gap-3">
              <Field label="순번"><input className={inputCls} value={item.n} onChange={(e) => update({ ...item, n: e.target.value })} /></Field>
              <Field label="제목"><input className={inputCls} value={item.t} onChange={(e) => update({ ...item, t: e.target.value })} /></Field>
              <div className="col-span-2"><Field label="설명"><textarea className={textareaCls} value={item.d} onChange={(e) => update({ ...item, d: e.target.value })} /></Field></div>
              <Field label="수행 시기"><input className={inputCls} value={item.when} onChange={(e) => update({ ...item, when: e.target.value })} /></Field>
            </div>
          )}
          newItem={() => ({ n: "", t: "", d: "", when: "" })}
        />
      </Section>
      <Section title="긴급 상황 대응">
        <Field label="제목"><input className={inputCls} value={form.emergencyTitle} onChange={(e) => setForm((p) => ({ ...p, emergencyTitle: e.target.value }))} /></Field>
        <Field label="설명"><textarea className={textareaCls} value={form.emergencyDescription} onChange={(e) => setForm((p) => ({ ...p, emergencyDescription: e.target.value }))} /></Field>
      </Section>
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─ CONTRACT ─ */
interface TierItem { name: string; scale: string; price: string; unit: string; items: string[]; featured: boolean }
interface TermItem { key: string; value: string }
interface ContractData { tiers: TierItem[]; terms: TermItem[]; footnote: string }

const defaultContract: ContractData = { tiers: [], terms: [], footnote: "" };

function ContractEditor({ data, onSave, saving }: EditorProps<ContractData>) {
  const [form, setForm] = useState<ContractData>(data || defaultContract);
  const [history, setHistory] = useState<Array<{ id: string; content: ContractData; changed_at: string; changed_by: string | null }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const { data: rows } = await supabase
      .from("site_content_history")
      .select("id, content, changed_at, changed_by")
      .eq("section_key", "contract")
      .order("changed_at", { ascending: false })
      .limit(20);
    setHistory(
      (rows || []).map((r) => ({
        id: r.id,
        content: r.content as unknown as ContractData,
        changed_at: r.changed_at,
        changed_by: r.changed_by,
      }))
    );
    setHistoryLoading(false);
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleSave = () => {
    onSave(form);
    // refresh history shortly after save
    setTimeout(() => loadHistory(), 800);
  };

  const restore = (snapshot: ContractData) => {
    if (!confirm("이 시점의 내용으로 편집기를 되돌립니다. (저장 버튼을 눌러야 사이트에 반영됩니다)")) return;
    setForm(snapshot);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_minmax(420px,520px)]">
      {/* ── Left: editor ── */}
      <div className="space-y-8">
        <Section title="요금제">
          <ListEditor
            items={form.tiers}
            onChange={(tiers) => setForm((p) => ({ ...p, tiers }))}
            renderItem={(item, i, update) => (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="이름"><input className={inputCls} value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} /></Field>
                  <Field label="규모"><input className={inputCls} value={item.scale} onChange={(e) => update({ ...item, scale: e.target.value })} /></Field>
                  <Field label="가격"><input className={inputCls} value={item.price} onChange={(e) => update({ ...item, price: e.target.value })} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="단위"><input className={inputCls} value={item.unit} onChange={(e) => update({ ...item, unit: e.target.value })} /></Field>
                  <Field label="추천 표시">
                    <div className="mt-2 flex items-center gap-3">
                      <Switch
                        checked={item.featured}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm((p) => ({
                              ...p,
                              tiers: p.tiers.map((t, idx) => ({ ...t, featured: idx === i })),
                            }));
                          } else {
                            update({ ...item, featured: false });
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.featured ? "추천 요금제로 강조" : "일반 표시"}
                      </span>
                    </div>
                  </Field>
                </div>
                <Field label="포함 항목 (줄바꿈 구분)">
                  <textarea className={textareaCls} value={item.items.join("\n")} onChange={(e) => update({ ...item, items: e.target.value.split("\n").filter(Boolean) })} />
                </Field>
              </div>
            )}
            newItem={() => ({ name: "", scale: "", price: "", unit: "", items: [], featured: false })}
          />
        </Section>
        <Section title="계약 조건">
          <ListEditor
            items={form.terms}
            onChange={(terms) => setForm((p) => ({ ...p, terms }))}
            renderItem={(item, i, update) => (
              <div className="grid grid-cols-2 gap-3">
                <Field label="항목"><input className={inputCls} value={item.key} onChange={(e) => update({ ...item, key: e.target.value })} /></Field>
                <Field label="내용"><input className={inputCls} value={item.value} onChange={(e) => update({ ...item, value: e.target.value })} /></Field>
              </div>
            )}
            newItem={() => ({ key: "", value: "" })}
          />
        </Section>
        <Section title="비고">
          <Field label="하단 안내문"><textarea className={textareaCls} value={form.footnote} onChange={(e) => setForm((p) => ({ ...p, footnote: e.target.value }))} /></Field>
        </Section>
        <SaveBar onSave={handleSave} saving={saving} />
      </div>

      {/* ── Right: live preview + history ── */}
      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div className="rounded-sm border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="font-serif text-base">실시간 미리보기</h3>
            <span className="text-xs text-muted-foreground">계약 페이지 요금제</span>
          </div>
          <div className="max-h-[60vh] overflow-auto p-4">
            <ContractPreview tiers={form.tiers} footnote={form.footnote} />
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card">
          <button
            onClick={() => setShowHistory((s) => !s)}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="flex items-center gap-2 font-serif text-base">
              <History className="h-4 w-4" /> 저장 히스토리 ({history.length})
            </span>
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showHistory && (
            <div className="max-h-[40vh] overflow-auto border-t border-border">
              {historyLoading && <div className="p-4 text-sm text-muted-foreground">불러오는 중...</div>}
              {!historyLoading && history.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">아직 저장 이력이 없습니다.</div>
              )}
              <ul className="divide-y divide-border">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {new Date(h.changed_at).toLocaleString("ko-KR")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        요금제 {(h.content?.tiers?.length ?? 0)}건 · 조건 {(h.content?.terms?.length ?? 0)}건
                      </div>
                    </div>
                    <button onClick={() => restore(h.content)} className={btnSecondary}>
                      <RotateCcw className="h-3 w-3" /> 되돌리기
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ContractPreview({ tiers, footnote }: { tiers: TierItem[]; footnote: string }) {
  if (!tiers || tiers.length === 0) {
    return <div className="text-sm text-muted-foreground">요금제를 추가하면 여기에 미리 보입니다.</div>;
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-px overflow-hidden rounded-sm bg-border">
        {tiers.map((t, idx) => (
          <div
            key={idx}
            className={`flex flex-col p-5 ${t.featured ? "bg-ink text-primary-foreground" : "bg-card"}`}
          >
            <div className="text-[10px] uppercase tracking-[0.25em] text-gold">{t.name || "—"}</div>
            <div className={`mt-2 font-serif text-base ${t.featured ? "text-primary-foreground" : "text-foreground"}`}>
              {t.scale || "규모 미입력"}
            </div>
            <div className="mt-4">
              <div className={`font-serif text-2xl ${t.featured ? "text-gold" : "text-foreground"}`}>
                {t.price || "—"}
              </div>
              <div className={`mt-1 text-xs ${t.featured ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                {t.unit}
              </div>
            </div>
            {t.items?.length > 0 && (
              <ul className={`mt-4 space-y-2 border-t pt-3 ${t.featured ? "border-primary-foreground/15" : "border-border"}`}>
                {t.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-gold" />
                    <span className={t.featured ? "text-primary-foreground/85" : "text-foreground/80"}>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      {footnote && <p className="text-xs text-muted-foreground">{footnote}</p>}
    </div>
  );
}

/* ─ CONTACT ─ */
interface ContactInfo { phone: string; phoneHours: string; email: string; emailHours: string; address: string; addressNote: string }
interface ContactData { info: ContactInfo; formTitle: string }

const defaultContact: ContactData = {
  info: { phone: "02-0000-0000", phoneHours: "평일 09:00 – 18:00", email: "info@junggam.kr", emailHours: "24시간 접수", address: "서울특별시 강남구 테헤란로", addressNote: "방문 상담 가능 (사전 예약)" },
  formTitle: "상담 신청서",
};

function ContactEditor({ data, onSave, saving }: EditorProps<ContactData>) {
  const [form, setForm] = useState<ContactData>(data || defaultContact);
  const setInfo = (key: keyof ContactInfo, value: string) => setForm((p) => ({ ...p, info: { ...p.info, [key]: value } }));
  return (
    <div className="space-y-8">
      <Section title="연락처 정보">
        <div className="grid grid-cols-2 gap-4">
          <Field label="전화번호"><input className={inputCls} value={form.info.phone} onChange={(e) => setInfo("phone", e.target.value)} /></Field>
          <Field label="전화 운영시간"><input className={inputCls} value={form.info.phoneHours} onChange={(e) => setInfo("phoneHours", e.target.value)} /></Field>
          <Field label="이메일"><input className={inputCls} value={form.info.email} onChange={(e) => setInfo("email", e.target.value)} /></Field>
          <Field label="이메일 운영"><input className={inputCls} value={form.info.emailHours} onChange={(e) => setInfo("emailHours", e.target.value)} /></Field>
          <Field label="주소"><input className={inputCls} value={form.info.address} onChange={(e) => setInfo("address", e.target.value)} /></Field>
          <Field label="주소 안내"><input className={inputCls} value={form.info.addressNote} onChange={(e) => setInfo("addressNote", e.target.value)} /></Field>
        </div>
      </Section>
      <Section title="상담 양식">
        <Field label="양식 제목"><input className={inputCls} value={form.formTitle} onChange={(e) => setForm((p) => ({ ...p, formTitle: e.target.value }))} /></Field>
      </Section>
      <SaveBar onSave={() => onSave(form)} saving={saving} />
    </div>
  );
}

/* ─── Reusable UI Blocks ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-sm border border-border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-5 text-left">
        <h3 className="font-serif text-lg">{title}</h3>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="space-y-4 border-t border-border p-5">{children}</div>}
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  renderItem,
  newItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (item: T) => void) => React.ReactNode;
  newItem: () => T;
}) {
  const update = (index: number, item: T) => {
    const next = [...items];
    next[index] = item;
    onChange(next);
  };
  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };
  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };
  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-sm border border-border bg-parchment p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
            <div className="flex gap-1">
              <button onClick={() => moveUp(i)} className={btnSecondary}><ChevronUp className="h-3 w-3" /></button>
              <button onClick={() => moveDown(i)} className={btnSecondary}><ChevronDown className="h-3 w-3" /></button>
              <button onClick={() => remove(i)} className={btnDanger}><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
          {renderItem(item, i, (updated) => update(i, updated))}
        </div>
      ))}
      <button onClick={() => onChange([...items, newItem()])} className={btnSecondary}>
        <Plus className="h-3 w-3" /> 항목 추가
      </button>
    </div>
  );
}

/* ─── 상담 신청 목록 ─── */
interface InquiryRow {
  id: string;
  org_name: string;
  contact_name: string;
  position: string | null;
  phone: string;
  email: string;
  stage: string | null;
  households: string | null;
  message: string | null;
  created_at: string;
}

function InquiriesPanel() {
  const [rows, setRows] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("contact_inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) setError(error.message);
      else setRows((data as InquiryRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-sm text-muted-foreground">불러오는 중...</div>;
  }

  if (error) {
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="py-16 text-center">
        <Inbox className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-muted-foreground">아직 접수된 상담 신청이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">총 {rows.length}건 · 최신순</p>
      {rows.map((r) => (
        <div key={r.id} className="rounded-sm border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="font-medium text-foreground">
              {r.org_name} <span className="text-muted-foreground">— {r.contact_name}{r.position ? ` (${r.position})` : ""}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString("ko-KR")}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>📞 {r.phone}</span>
            <span>✉️ {r.email}</span>
            {r.stage && <span>단계: {r.stage}</span>}
            {r.households && <span>규모: {r.households}</span>}
          </div>
          {r.message && (
            <p className="mt-3 whitespace-pre-wrap rounded-sm bg-muted/50 p-3 text-sm text-foreground/80">
              {r.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
