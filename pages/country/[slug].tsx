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
              <h2 className="text-2xl font-bold text-primary mb-6">Miejsca ({locations.length})</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map((loc, index) => (
                  <motion.div
                    key={loc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group"
                  >
                    <a
                      href={`/?country=${encodeURIComponent(country)}&placeId=${encodeURIComponent(loc.id)}`}
                      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`flex items-center gap-1 bg-${loc.type} text-${loc.type}-text text-xs font-semibold border border-${loc.type}-border rounded-full px-2 py-1 flex-shrink-0`}>
                            {loc.type === 'restaurant' ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            ) : loc.type === 'attraction' ? (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            ) : (
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                            {loc.type === 'restaurant' ? 'Restauracja' : loc.type === 'attraction' ? 'Atrakcja' : 'Inne'}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-primary group-hover:text-primary-hover transition-colors text-sm mb-2 line-clamp-2">
                        {loc.name}
                      </h3>
                      
                      {loc.description && (
                        <p className="text-gray-600 text-xs line-clamp-2 mb-3">
                          {loc.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {loc.address}
                        </span>
                        <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-primary mb-6">Powiązane odcinki ({videos.length})</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.videoId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="group"
                  >
                    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-primary group-hover:text-primary-hover transition-colors text-sm mb-1 line-clamp-2">
                            {video.filterTitle}
                          </h3>
                          
                          {video.date && (
                            <p className="text-xs text-gray-500 mb-2">
                              {video.date}
                            </p>
                          )}
                          
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Obejrzyj na YouTube
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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


