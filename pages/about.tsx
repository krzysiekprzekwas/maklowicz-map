import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <main className="flex min-h-screen flex-col bg-secondary">
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
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  Mapa
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-secondary border-b-2 border-secondary"
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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-primary mb-8">O projekcie</h2>
          
          <div className="prose prose-lg prose-stone">
            <p className="text-primary-hover mb-6">
              "Śladami Roberta Makłowicza" to interaktywna mapa przedstawiająca wszystkie restauracje, 
              kawiarnie i inne miejsca kulinarne, które odwiedził Robert Makłowicz w swoich programach. 
              Projekt powstał z pasji do gotowania i podróżowania, inspirowany niezwykłymi przygodami 
              kulinarnymi Roberta Makłowicza.
            </p>

            <p className="text-primary-hover mb-6">
              Mapa jest stale aktualizowana o nowe lokalizacje z najnowszych odcinków programu na YouTube. 
              Każde miejsce zawiera szczegółowe informacje, w tym link do odcinka, w którym zostało 
              zaprezentowane.
            </p>

            <h3 className="text-2xl font-bold text-primary mt-8 mb-4">Jak korzystać z mapy?</h3>
            
            <ul className="list-disc list-inside text-primary-hover space-y-2 mb-6">
              <li>Przeglądaj wszystkie lokalizacje na mapie</li>
              <li>Filtruj miejsca według odcinków programu</li>
              <li>Kliknij w znacznik, aby zobaczyć szczegółowe informacje</li>
              <li>Oglądaj powiązane odcinki bezpośrednio na YouTube</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 