import { useRouter } from "next/router";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { useState, useEffect, useRef } from "react";

const navLinks = [
  { href: "/", label: "Mapa" },
  { href: "/about", label: "O projekcie" },
  { href: "/contact", label: "Kontakt" },
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
    `transition-colors border-b-2 border-primary hover:border-secondary-darker ${
      pathname === href ? "border-secondary-darker text-secondary-darker font-bold" : ""
    }`;

  return (
    <header ref={headerRef} className="bg-primary text-secondary relative z-[10000]">
      {/* Mobile layout */}
      <div className="md:hidden container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/hat.svg" alt="Logo" className="w-8 h-auto invert" />
          <span className="text-base font-bold">Śladami Roberta Makłowicza</span>
        </div>
        <button
          onClick={() => setIsMenuOpen((o) => !o)}
          className="p-2 text-secondary"
          aria-label="Menu"
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-primary border-t border-secondary/20">
          <ul>
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block px-4 py-3 text-base ${
                    pathname === href ? "font-bold text-secondary-darker" : "text-secondary"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Desktop layout */}
      <div className="hidden md:block container mx-auto px-6 py-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/hat.svg" alt="Logo" className="w-12 h-auto invert" />
            <div>
              <h1 className="text-3xl font-bold mb-2">Śladami Roberta Makłowicza</h1>
              <p className="text-lg opacity-90">Mapa miejsc odwiedzonych przez Roberta Makłowicza</p>
            </div>
          </div>
          <nav>
            <ul className="flex space-x-6 items-center text-lg">
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
