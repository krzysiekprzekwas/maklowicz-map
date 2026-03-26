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
      <div className={`md:hidden flex items-center justify-center px-4 ${pathname === "/" ? "pt-4 h-20" : "h-16"}`}>
        <Link href="/">
          <img
            src={pathname === "/" ? "/main_mobile_header.svg" : "/new_logo.svg"}
            alt="Śladami Roberta Makłowicza"
            className={pathname === "/" ? "h-16" : "h-8"}
          />
        </Link>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block container mx-auto px-6 py-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <Link href="/">
            <img src="/new_logo_desktop.svg" alt="Śladami Roberta Makłowicza" className="h-8" />
          </Link>
          <nav>
            <ul className="flex space-x-6 items-center text-lg text-neutral-1000">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass(href)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <Analytics mode={process.env.NODE_ENV as "development" | "production"} />
    </header>
  );
}
