import React from 'react';
import { useLocations } from '../hooks/useLocations';

export default function About() {

  const { videoCount, totalLocations } = useLocations('', null, null);


  return (
    <main className="flex flex-1 flex-col bg-secondary">
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

            <h3 className="text-2xl font-bold text-primary mt-8 mb-4">Ile jest lokalizacji?</h3>
            
            <p className="text-primary-hover mb-6">
              Będąc projektem hobbistycznym, mapa może mieć braki względem całej twórczości Roberta Makłowicza. Staramy się jednak regularnie dodawać nowe lokalizacje, aby mapa była jak najbardziej kompletna. Na dziś przetworzylismy:
            </p>
            <ul className="list-disc list-inside text-primary-hover space-y-2 mb-6">
              <li> {totalLocations} Lokalizacji</li>
              <li> {videoCount} Filmow</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
} 