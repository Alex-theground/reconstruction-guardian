import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "./BrandMark";


const nav = [
  { to: "/", label: "홈" },
  { to: "/cases", label: "왜 필요한가" },
  { to: "/simulator", label: "손실 시뮬레이터" },
  { to: "/services", label: "서비스" },
  { to: "/process", label: "감독 프로세스" },
  { to: "/contract", label: "계약 안내" },
  { to: "/contact", label: "문의" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center">
          <BrandMark size={48} variant="dark" className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
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

        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
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
