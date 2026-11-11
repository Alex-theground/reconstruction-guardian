import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Button } from "./ui/button";


const nav = [
  { to: "/", label: "홈" },
  { to: "/cases", label: "왜 필요한가" },
  { to: "/simulator", label: "손실 시뮬레이터" },
  { to: "/services", label: "서비스" },
  { to: "/apartment-audit", label: "아파트감사" },
  { to: "/process", label: "감독 프로세스" },
  { to: "/contract", label: "계약 안내" },
  { to: "/contact", label: "문의" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-3">
          <BrandMark size={40} variant="dark" className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          <div className="leading-tight">
            <div className="font-serif text-lg tracking-tight text-foreground">바른집행</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Right Execution Partners
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="rounded-sm bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-ink/90"
          >
            상담 신청
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-6 py-4 xl:hidden">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm text-foreground/80"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
