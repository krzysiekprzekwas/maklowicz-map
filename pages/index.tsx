import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Mail } from 'lucide-react';
import locationData from '../data/locations.json';
import type { LocationData } from '../types/Location';
import { LandingSearch } from '../components/filters/LandingSearch';
import { FeaturedCarousel } from '../components/landing/FeaturedCarousel';

const typedData = locationData as LocationData;

const allLocations = typedData.videos.flatMap((v) => v.locations);
const totalLocations = allLocations.length;
const videoCount = typedData.videos.filter((v) => v.locations?.length > 0).length;
const countryCount = new Set(allLocations.map((l) => l.country)).size;

const countries = Object.entries(
  allLocations.reduce<Record<string, number>>((acc, l) => {
    acc[l.country] = (acc[l.country] || 0) + 1;
    return acc;
  }, {})
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => a.name.localeCompare(b.name));

// Most recent locations — sorted by parent video date, filtered to ones with images + summaries
const sortedVideos = [...typedData.videos].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
const featured = sortedVideos
  .flatMap((v) => v.locations)
  .filter((l) => l.image && l.summary)
  .slice(0, 12);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-bg-primary">
      {/* Hero */}
      <section className="relative z-10 px-4 pt-8 pb-6 md:pt-16 md:pb-10 max-w-3xl mx-auto w-full">
        <motion.h1
          {...fadeUp(0)}
          className="font-heading text-2xl md:text-4xl text-primary leading-[120%] mb-6 text-center px-4 md:px-8"
        >
          <span className="font-light">Odkrywaj miejsca, historie i{' '}smaki znane z podróży</span>
          <br />
          <span className="font-bold">Roberta Makłowicza</span>
        </motion.h1>

        <motion.div {...fadeUp(0.1)} className="mb-6">
          <LandingSearch countries={countries} filteredCount={totalLocations} />
        </motion.div>
      </section>

      {/* Featured locations carousel */}
      <section className="py-6 md:py-10">
        <motion.div {...fadeUp(0.15)} className="max-w-3xl mx-auto w-full mb-4 px-4">
          <h2 className="text-lg font-bold text-primary">Niedawno odwiedzone</h2>
        </motion.div>
        <motion.div {...fadeUp(0.2)}>
          <FeaturedCarousel locations={featured} />
        </motion.div>
      </section>

      {/* Stats + CTA */}
      <section className="px-4 py-10 md:py-16">
        <div className="max-w-3xl mx-auto w-full text-center">
          <motion.p
            {...fadeUp(0.1)}
            className="text-lg md:text-xl text-primary font-medium mb-8 max-w-md mx-auto"
          >
            Mapa miejsc odwiedzonych przez Roberta Makłowicza pozwala eksplorować!
          </motion.p>

          <motion.div {...fadeUp(0.15)} className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
            {[
              { value: totalLocations, label: 'Miejsc' },
              { value: videoCount, label: 'Odcinków' },
              { value: countryCount, label: 'Krajów' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-neutral-0 rounded-2xl border border-neutral-200 px-3 py-4">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-sm text-neutral-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          <motion.div {...fadeUp(0.2)}>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-accent text-neutral-1000 font-semibold hover:bg-accent/90 transition-colors text-base shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Szukaj na mapie
            </Link>
          </motion.div>
        </div>
      </section>

      {/* O Projekcie */}
      <section className="px-4 py-10 md:py-16 bg-neutral-0">
        <div className="max-w-3xl mx-auto w-full">
          <motion.h2 {...fadeUp(0)} className="text-2xl font-bold text-primary mb-6">
            O Projekcie
          </motion.h2>
          <motion.div {...fadeUp(0.1)} className="space-y-4 text-neutral-500 leading-relaxed">
            <p>
              Programy Roberta Makłowicza towarzyszą mi od dziecka. Weekendowe wyprawy przed telewizorem były małym rytuałem, który zaszczepił we mnie ciekawość świata, ludzi i historii.
            </p>
            <p>
              Kiedy w czasach lockdownu Robert wrócił z kanałem na YouTube, poczułem to samo co kiedyś. Jakbym znowu jechał z nim w podróż. W pewnym momencie przyszła myśl:
            </p>
            <blockquote className="border-l-2 border-primary/30 pl-4 italic">
              Fajnie byłoby zobaczyć na mapie wszystkie te miejsca. A przecież mogę to zbudować!
            </blockquote>
            <p>
              Tak powstała ta mapa. Oglądam odcinki, mapuję miejsca, dodaję opisy. Projekt jest hobbistyczny i może nie obejmować całej twórczości Roberta, ale staram się go regularnie uzupełniać.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-4 py-10 md:py-14">
        <div className="max-w-3xl mx-auto w-full text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-sm font-medium text-neutral-500 mb-3">Napisz do mnie</p>
            <a
              href="mailto:przekwaskrzysiek@gmail.com"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent-blue text-neutral-0 font-semibold hover:bg-accent-blue/90 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4" />
              przekwaskrzysiek@gmail.com
            </a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
