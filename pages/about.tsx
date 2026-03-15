import { motion } from 'framer-motion';
import locationData from '../data/locations.json';
import { MapIcon } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay },
});

const totalLocations = locationData.videos.flatMap((v) => v.locations).length;
const videoCount = locationData.videos.filter((v) => v.locations?.length > 0).length;
const countryCount = new Set(locationData.videos.flatMap((v) => v.locations).map((l) => l.country)).size;

export default function About() {
  return (
    <main className="flex flex-1 flex-col bg-secondary overflow-y-auto">
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-2xl">

        <motion.h1 {...fadeUp(0)} className="text-4xl font-bold text-primary mb-10">
          O projekcie
        </motion.h1>

        {/* Personal story */}
        <motion.div {...fadeUp(0.1)} className="mb-10 space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Programy Roberta Makłowicza towarzyszą mi od dziecka. Weekendowe wyprawy przed telewizorem były małym rytuałem, który zaszczepił we mnie ciekawość świata, ludzi i historii.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Kiedy w czasach lockdownu Robert wrócił z kanałem na YouTube, poczułem to samo co kiedyś. Jakbym znowu jechał z nim w podróż. W pewnym momencie przyszła myśl:
          </p>
          <blockquote className="border-l-2 border-primary/30 pl-4 text-gray-600">
            Fajnie byłoby zobaczyć na mapie wszystkie te miejsca. A przecież mogę to zbudować!
          </blockquote>
          <p className="text-gray-700 leading-relaxed">
            Tak powstała ta mapa. Oglądam odcinki, mapuję miejsca, dodaję opisy. Projekt jest hobbistyczny i może nie obejmować całej twórczości Roberta, ale staram się go regularnie uzupełniać. Dla wszystkich, którzy chcą podążać jego śladami.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-3 gap-3 mb-10">
          {[
            { value: totalLocations, label: 'miejsc' },
            { value: videoCount, label: 'odcinków' },
            { value: countryCount, label: 'krajów' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-secondary-border px-4 py-5 text-center">
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.25)}>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <MapIcon className="w-5 h-5" />
            Odkryj mapę
          </a>
        </motion.div>

      </div>
    </main>
  );
}
