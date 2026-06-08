import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "관리자 로그인 — 정감 컨설팅" }],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { user, isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in as admin, redirect
  if (!loading && user && isAdmin) {
    navigate({ to: "/admin/dashboard" });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
      // Auth state change will trigger re-render and redirect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-pulse font-serif text-xl text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (user && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="mx-auto max-w-md rounded-sm border border-border bg-card p-10 text-center">
          <Lock className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-6 font-serif text-2xl">접근 권한 없음</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            관리자 권한이 없는 계정입니다. 관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-sm border border-border bg-card p-10 shadow-soft">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-ink text-gold font-serif text-2xl">
              正
            </div>
            <h1 className="mt-6 font-serif text-3xl">관리자 로그인</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              정감 컨설팅 홈페이지 콘텐츠 관리
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-sm border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-input bg-background py-3 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-muted-foreground">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-sm border border-input bg-background py-3 pl-10 pr-10 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-ink py-3 text-sm font-medium text-primary-foreground hover:bg-ink/90 disabled:opacity-50"
            >
              {submitting ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
