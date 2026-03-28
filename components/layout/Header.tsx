import { useRouter } from "next/router";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

export function Header() {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <header className={`${pathname === "/" ? "bg-transparent" : "bg-bg-primary"} relative z-[10000] ${pathname !== "/" ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""}`}>
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
