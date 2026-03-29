import Link from 'next/link';
import { motion } from 'framer-motion';
import { Map, Instagram, Mail } from 'lucide-react';
import locationData from '../data/locations.json';
import type { LocationData, Location } from '../types/Location';
import { LandingSearch } from '../components/filters/LandingSearch';
import { FeaturedCarousel } from '../components/landing/FeaturedCarousel';
import FEATURED_LOCATION_IDS from '../data/featured';

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

// Featured locations — configured in data/featured.ts, preserving the configured order
const locationById = Object.fromEntries(allLocations.map((l) => [l.id, l]));
const featured = FEATURED_LOCATION_IDS
  .map((id) => locationById[id])
  .filter((l): l is Location => !!l && !!l.image && !!l.summary);

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function LandingPage() {
  return (
    <main className="flex-1 flex flex-col bg-bg-primary">
      {/* Hero */}
      <section className="relative z-10 px-4 pt-8 md:pt-16 md:pb-8 max-w-3xl mx-auto w-full">
        <motion.h1
          {...fadeUp(0)}
          className="font-heading text-2xl md:text-4xl text-primary leading-[120%] mb-6 text-center px-4 md:px-8"
        >
          <span className="font-light">Odkrywaj miejsca, historie i{' '}smaki znane z podróży</span>
          <br />
          <span className="font-bold">Roberta Makłowicza</span>
        </motion.h1>

        <motion.div {...fadeUp(0.1)} className="mb-6 md:max-w-[480px] md:mx-auto">
          <LandingSearch countries={countries} />
        </motion.div>
      </section>

      {/* Featured locations carousel */}
      <section className="pb-4 md:pb-12 md:py-10">
        <motion.div {...fadeUp(0.15)} className="mb-4 px-4 md:px-24">
          <h2 className="text-lg font-bold text-primary">Polecane miejsca</h2>
        </motion.div>
        <motion.div {...fadeUp(0.2)}>
          <FeaturedCarousel locations={featured} />
        </motion.div>
      </section>

      {/* Stats + CTA */}
      <section className="px-4 md:px-24 py-4 md:py-12">
          <div className="bg-neutral-0 rounded-3xl px-6 py-10 md:px-10 md:py-14 text-center">
            <motion.div {...fadeUp(0.1)} className="flex justify-center mb-4">
            <img src="/red_pin.svg" alt="" aria-hidden className="w-10 h-11" />
            </motion.div>

            <motion.p
              {...fadeUp(0.12)}
              className="text-lg font-semibold text-neutral-1000 mb-8"
            >
              Na mapie znajdziesz
            </motion.p>

            <motion.div {...fadeUp(0.15)} className="grid grid-cols-3 gap-3 mb-10 max-w-md mx-auto">
              {[
                { value: totalLocations, label: 'Miejsc' },
                { value: videoCount, label: 'Odcinków' },
                { value: countryCount, label: 'Krajów' },
              ].map(({ value, label }) => (
                <div key={label} className="px-3 py-2">
                  <p className="text-4xl md:text-5xl font-bold text-neutral-1000">{value}</p>
                  <p className="text-sm text-neutral-500 mt-1">{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div {...fadeUp(0.2)}>
              <Link
                href="/map"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-neutral-1000 text-neutral-0 font-semibold hover:bg-accent-blue transition-colors text-base"
              >
                <Map className="w-4 h-4" />
                Szukaj na mapie
              </Link>
            </motion.div>
          </div>
      </section>

      {/* O projekcie */}
      <section className="px-4 md:px-24 py-10 md:py-12 md:pb-16 bg-bg-primary">
        <div className="md:grid md:grid-cols-2 md:gap-10 md:items-start">
          {/* Illustration — desktop left column */}
          <motion.div {...fadeUp(0)} className="hidden md:block">
            <img
              src="/kristof_main.png"
              alt="O projekcie"
              className="w-full rounded-2xl object-cover"
            />
          </motion.div>

          {/* Text — right column on desktop, full width on mobile */}
          <div>
            <motion.h2 {...fadeUp(0)} className="text-2xl font-bold text-primary mb-6">
              O projekcie
            </motion.h2>
            <motion.div {...fadeUp(0.1)} className="space-y-4 text-neutral-500 leading-relaxed">
              <p>
                Programy <a href="https://www.maklowicz.pl/" target="_blank" rel="noopener noreferrer" className="text-accent-blue font-semibold underline underline-offset-2 decoration-accent-blue/30 hover:decoration-accent-blue transition-colors">Roberta Makłowicza</a> towarzyszą mi od dziecka. Weekendowe wyprawy przed telewizorem były małym rytuałem, który zaszczepił we mnie ciekawość świata, ludzi i historii.
              </p>
              <p>
                Kiedy Robert wrócił z <a href="https://www.youtube.com/@Robert_Maklowicz" target="_blank" rel="noopener noreferrer" className="text-accent-blue font-semibold underline underline-offset-2 decoration-accent-blue/30 hover:decoration-accent-blue transition-colors">kanałem na YouTube</a>, poczułem to samo co kiedyś. Jakbym znowu jechał z nim w podróż.
              </p>
              <blockquote className="border-l-2 border-primary/30 pl-4 italic">
                Chciałbym kiedyś odwiedzić te miejsca. I zobaczyć je na własne oczy.
              </blockquote>
              <p>
                Tak powstała ta mapa. Oglądam odcinki, mapuję miejsca, dodaję opisy. Projekt jest hobbistyczny i może nie obejmować całej twórczości Roberta, ale staram się go regularnie uzupełniać.
              </p>
              <p>
                Dla wszystkich, którzy chcą podążać jego śladami.
              </p>
              <p className="mt-2 text-right">
                — <a href="https://kristof.pro" target="_blank" rel="noopener noreferrer" className="text-accent-blue font-semibold underline underline-offset-2 decoration-accent-blue/30 hover:decoration-accent-blue transition-colors">Krzysiek</a>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact CTA + Footer pins */}
      <motion.div
        {...fadeUp(0)}
        className="bg-accent-blue rounded-t-3xl px-6 py-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-0 mb-5">Napisz do mnie</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <a
            href="mailto:przekwaskrzysiek@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-0/15 text-neutral-0 hover:bg-neutral-0/25 transition-colors text-sm md:text-base"
          >
            <Mail className="w-4 h-4" />
            przekwaskrzysiek@gmail.com
          </a>
          <a
            href="https://www.instagram.com/sladami_roberta/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-0/15 text-neutral-0 hover:bg-neutral-0/25 transition-colors text-sm md:text-base"
          >
            <Instagram className="w-4 h-4" />
            @sladami_roberta
          </a>
        </div>
      </motion.div>
      <div className="w-full overflow-hidden">
        <img
          src="/footer_pins.svg"
          alt=""
          aria-hidden
          className="w-full min-w-[393px] select-none md:hidden"
        />
        <img
          src="/desktop_footer.svg"
          alt=""
          aria-hidden
          className="w-full select-none hidden md:block"
        />
      </div>
    </main>
  );
}
