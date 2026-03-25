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
      <div className="md:hidden flex items-center justify-center h-16 px-4 bg-bg-primary">
        <span className="font-handwritten text-2xl font-bold text-accent-blue">Śladami Roberta Makłowicza</span>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block container mx-auto px-6 py-4">
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img src="/hat.svg" alt="Logo" className="w-12 h-auto invert" />
            <div>
              <h1 className="font-handwritten text-4xl leading-none mb-2">Śladami Roberta Makłowicza</h1>
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
