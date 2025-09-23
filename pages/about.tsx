import React from 'react';
import { useLocations } from '../hooks/useLocations';
import { motion } from 'framer-motion';
import { countrySlug } from '../src/lib/slug';

export default function About() {

  const { videoCount, totalLocations } = useLocations('', null, null);


  return (
    <main className="flex flex-1 flex-col bg-secondary">
      <div className="container mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-primary mb-8">O projekcie</h2>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 prose prose-lg prose-stone"
          >
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-primary-hover mb-6"
            >
              "Śladami Roberta Makłowicza" to interaktywna mapa przedstawiająca wszystkie restauracje, 
              kawiarnie i inne miejsca kulinarne, które odwiedził Robert Makłowicz w swoich programach. 
              Projekt powstał z pasji do gotowania i podróżowania, inspirowany niezwykłymi przygodami 
              kulinarnymi Roberta Makłowicza.
            </motion.p>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-primary-hover mb-6"
            >
              Mapa jest stale aktualizowana o nowe lokalizacje z najnowszych odcinków programu na YouTube. 
              Każde miejsce zawiera szczegółowe informacje, w tym link do odcinka, w którym zostało 
              zaprezentowane.
            </motion.p>

            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-bold text-primary mt-8 mb-4"
            >
              Jak korzystać z mapy?
            </motion.h3>
            
            <motion.ul 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="list-disc list-inside text-primary-hover space-y-2 mb-6"
            >
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Przeglądaj wszystkie lokalizacje na mapie</motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Filtruj miejsca według odcinków programu</motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Kliknij w znacznik, aby zobaczyć szczegółowe informacje</motion.li>
              <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>Oglądaj powiązane odcinki bezpośrednio na YouTube</motion.li>
            </motion.ul>

          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-2xl font-bold text-primary mt-8 mb-4"
          >
            Dokąd chcesz wyruszyć?
          </motion.h3>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-primary-hover mb-6"
          >
            Odkryj kolejne przygody — skorzystaj z mapy i sprawdź kraje, które odwiedził Robert Makłowicz.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <a
              href={`/country/${countrySlug('Polska')}`}
              className="group flex items-center justify-between p-6 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors"
            >
              <span className="text-xl font-semibold">Polska</span>
              <span className="text-3xl" aria-hidden>🇵🇱</span>
            </a>
            <a
              href={`/country/${countrySlug('Chorwacja')}`}
              className="group flex items-center justify-between p-6 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors"
            >
              <span className="text-xl font-semibold">Chorwacja</span>
              <span className="text-3xl" aria-hidden>🇭🇷</span>
            </a>
            <a
              href={`/country/${countrySlug('Włochy')}`}
              className="group flex items-center justify-between p-6 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors"
            >
              <span className="text-xl font-semibold">Włochy</span>
              <span className="text-3xl" aria-hidden>🇮🇹</span>
            </a>
            <a
              href={`/country/${countrySlug('Austria')}`}
              className="group flex items-center justify-between p-6 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg transition-colors"
            >
              <span className="text-xl font-semibold">Austria</span>
              <span className="text-3xl" aria-hidden>🇦🇹</span>
            </a>
          </motion.div>

            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-2xl font-bold text-primary mt-8 mb-4"
            >
              Ile jest lokalizacji?
            </motion.h3>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 }}
              className="text-primary-hover mb-6"
            >
              Będąc projektem hobbistycznym, mapa może mieć braki względem całej twórczości Roberta Makłowicza. Staramy się jednak regularnie dodawać nowe lokalizacje, aby mapa była jak najbardziej kompletna. Na dziś przetworzylismy:
            </motion.p>
            
            <motion.ul 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.2 }}
              className="list-disc list-inside text-primary-hover space-y-2 mb-6"
            >
              <motion.li 
                whileHover={{ x: 5 }} 
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-2"
              >
                <span className="font-bold">{totalLocations}</span> Lokalizacji
              </motion.li>
              <motion.li 
                whileHover={{ x: 5 }} 
                transition={{ type: "spring", stiffness: 300 }}
                className="flex items-center gap-2"
              >
                <span className="font-bold">{videoCount}</span> Filmów
              </motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 