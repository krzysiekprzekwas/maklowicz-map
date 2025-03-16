import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';

export function Header() {
  return (
    <header className="bg-primary text-secondary">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Śladami Roberta Makłowicza</h1>
            <p className="text-base md:text-lg opacity-90">Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza</p>
          </div>
          <nav className="flex justify-end">
            <ul className="flex space-x-4 md:space-x-6 items-center text-base md:text-lg">
              <li>
                <Link 
                  href="/" 
                  className="text-secondary border-b-2 border-secondary"
                >
                  Mapa
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  O projekcie
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Analytics />
    </header>
  );
} 