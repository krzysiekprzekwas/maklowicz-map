import { useRouter } from "next/router";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "/map", label: "Mapa" },
];

export function Header() {
  const router = useRouter();
  const pathname = router.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    `transition-colors border-b-2 hover:border-neutral-1000 ${
      pathname === href ? "border-neutral-1000 font-bold" : "border-transparent"
    }`;

  return (
    <header ref={headerRef} className={`${pathname === "/" ? "bg-transparent" : "bg-bg-primary"} relative z-[10000]`}>
      {/* Mobile layout */}
      <div className={`md:hidden flex items-center justify-center px-4 ${pathname === "/" ? "pt-4" : ""} h-20`}>
        <Link href="/">
          <img
            src="/main_mobile_header.svg"
            alt="Śladami Roberta Makłowicza"
            className="h-16"
          />
        </Link>
      </div>

      {/* Desktop layout — hidden on /map where the logo is in the map's own top bar */}
      <div className={`hidden ${pathname === "/map" ? "" : "md:flex"} items-center justify-center px-6 h-20`}>
        <Link href="/">
          <img src="/main_mobile_header.svg" alt="Śladami Roberta Makłowicza" className="h-16" />
        </Link>
      </div>

      <Analytics mode={process.env.NODE_ENV as "development" | "production"} />
    </header>
  );
}
