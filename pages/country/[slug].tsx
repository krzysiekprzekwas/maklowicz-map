import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import { motion } from 'framer-motion';
import locationData from '../../data/locations.json';
import { countrySlug, placeSlug } from '../../src/lib/slug';
import { toLocative } from '../../src/lib/countryLocatives';
import type { Location, Video } from '../../types/Location';

type Props = {
  country: string;
  locations: Location[];
  videos: Video[];
};

export default function CountryPage({ country, locations, videos }: Props) {
  const countryLoc = toLocative(country);
  const title = `${country} – śladami Roberta Makłowicza`;
  const description = `Miejsca z programu Roberta Makłowicza w ${countryLoc}. Zobacz restauracje, atrakcje i odcinki.`;
  const canonical = `https://sladami-roberta.pl/country/${countrySlug(country)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    url: canonical,
    itemListElement: locations.map((loc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${canonical}/place/${placeSlug(loc.name)}`,
      name: loc.name,
    })),
  };

  return (
    <main className="flex flex-1 flex-col bg-secondary">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>
      <div className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold text-primary mb-8">{country}</h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-primary-hover mb-6"
            >
              Robert Makłowicz odwiedził co najmniej <span className="font-semibold">{locations.length}</span> miejsc w {countryLoc} podczas <span className="font-semibold">{videos.length}</span> odcinków, które udokumentowaliśmy na tej stronie. Znajdź swoją następną przygodę — kulinarną, historyczną lub po prostu dla zabawy.
            </motion.p>

            <div className="mb-8 p-4 bg-secondary rounded-md border border-primary/10">
              <p className="text-primary-hover mb-3">Użyj mapy, aby zobaczyć wszystkie miejsca odwiedzone przez Roberta Makłowicza w {countryLoc}.</p>
              <a
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-hover transition-colors"
                href={`/?country=${encodeURIComponent(country)}`}
              >
                Przejdź do mapy
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">Miejsca</h2>
              <ul className="list-disc list-inside text-primary-hover space-y-2">
                {locations.map((loc) => (
                  <motion.li key={loc.id} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <a
                      className="text-primary hover:text-primary-hover underline-offset-2 hover:underline"
                      href={`/?country=${encodeURIComponent(country)}&placeId=${encodeURIComponent(loc.id)}`}
                    >
                      {loc.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-primary mb-4">Powiązane odcinki</h2>
              <ul className="list-disc list-inside text-primary-hover space-y-2">
                {videos.map((v) => (
                  <motion.li key={v.videoId} whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                    {v.filterTitle}
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const countries = new Set<string>();
  locationData.videos.forEach((v) => v.locations.forEach((l) => countries.add(l.country)));
  const paths = Array.from(countries).map((c) => ({ params: { slug: countrySlug(c) } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const allLocations = locationData.videos.flatMap((v) => v.locations);
  const countryEntry = allLocations.find((l) => countrySlug(l.country) === slug)?.country || '';
  const locations = allLocations.filter((l) => l.country === countryEntry);
  const videos = locationData.videos.filter((v) => v.locations.some((l) => l.country === countryEntry));

  return {
    props: {
      country: countryEntry,
      locations: locations as unknown as Location[],
      videos: videos as unknown as Video[],
    },
  };
};


