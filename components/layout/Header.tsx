import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-primary text-secondary">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Śladami Roberta Makłowicza</h1>
          <p className="text-lg opacity-90">Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza</p>
        </div>
        <nav>
          <ul className="flex space-x-6 items-center text-lg">
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
    </header>
  );
} 