import { useRouter } from "next/router";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

const styles = {
  header: "bg-primary text-secondary",
  container: "container mx-auto px-4 md:px-6 py-2 md:py-4",
  layout: "flex flex-col md:flex-row md:justify-between md:items-center gap-1 md:gap-4",
  title: "text-xl md:text-3xl font-bold md:mb-2", 
  subtitle: "text-sm md:text-lg opacity-90",
  nav: "flex space-x-4 md:space-x-6 items-center text-base md:text-lg",
  link: "transition-colors border-b-2 border-primary hover:border-secondary-darker",
  activeLink: "border-secondary-darker text-secondary-darker font-bold",
  logoTitleContainer: "flex items-center gap-4",
  logo: "w-12 h-auto invert",
};

export function Header() {
  const router = useRouter();
  const pathname = router.pathname;

  const navLinks = [
    { href: "/", label: "Mapa" },
    { href: "/about", label: "O projekcie" },
    { href: "/contact", label: "Kontakt" },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.layout}>
        <div className={styles.logoTitleContainer}>
          <img
            src="/hat.svg"
            alt="Logo"
            className={styles.logo}
          />
          <div>
            <h1 className={styles.title}>Śladami Roberta Makłowicza</h1>
            <p className={styles.subtitle}>
              Mapa miejsc odwiedzonych przez Roberta Makłowicza
            </p>
          </div>
        </div>
          <nav>
            <ul className={styles.nav}>
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${styles.link} ${pathname === href ? styles.activeLink : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <Analytics />
    </header>
  );
}
