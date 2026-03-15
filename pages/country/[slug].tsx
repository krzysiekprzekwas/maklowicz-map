import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { MapIcon } from 'lucide-react';
import locationData from '../../data/locations.json';

const CountryMiniMap = dynamic(() => import('../../components/country/CountryMiniMap'), { ssr: false });
import { countrySlug, placeSlug } from '../../src/lib/slug';
import { toLocative } from '../../src/lib/countryLocatives';
import { TYPE_META } from '../../src/lib/locationTypeMeta';
import type { Location, Video } from '../../types/Location';

const PREVIEW_COUNT = 5;
const VIDEO_PREVIEW_COUNT = 6;

type Props = {
  country: string;
  locations: Location[];
  videos: Video[];
};

function LocationCard({ loc, country }: { loc: Location; country: string }) {
  const meta = TYPE_META[loc.type] ?? TYPE_META.tourist_attraction;
  const TypeIcon = meta.icon;

  return (
    <a
      href={`/?country=${encodeURIComponent(country)}&placeId=${encodeURIComponent(loc.id)}`}
      className="flex overflow-hidden rounded-2xl border border-secondary-border bg-white hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0 w-28 min-h-28 self-stretch bg-secondary flex items-center justify-center">
        {loc.image ? (
          <img
            src={loc.image}
            alt={loc.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <TypeIcon className="h-8 w-8 text-primary opacity-30" />
        )}
      </div>
      <div className="flex-1 min-w-0 p-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <TypeIcon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
          <span className="font-semibold text-primary text-sm line-clamp-1">{loc.name}</span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-3">{loc.summary || loc.description || loc.address}</p>
        <p className="text-xs text-gray-400 mt-0.5">{loc.country}</p>
      </div>
    </a>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <a
      href={video.videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-2xl border border-secondary-border bg-white p-3 hover:shadow-md transition-shadow"
    >
      <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-secondary">
        <img
          src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
          alt={video.filterTitle}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-primary text-sm line-clamp-1 mb-1">{video.filterTitle}</p>
        {video.date && <p className="text-xs text-gray-400">{video.date}</p>}
        <p className="text-xs text-red-600 font-medium mt-1">YouTube ↗</p>
      </div>
    </a>
  );
}

export default function CountryPage({ country, locations, videos }: Props) {
  const countryLoc = toLocative(country);
  const title = `${country} – śladami Roberta Makłowicza`;
  const description = `Miejsca z programu Roberta Makłowicza w ${countryLoc}. Zobacz restauracje, atrakcje i odcinki.`;
  const canonical = `https://sladami-roberta.pl/country/${countrySlug(country)}`;

  const previewLocations = locations.slice(0, PREVIEW_COUNT);
  const remaining = locations.length - PREVIEW_COUNT;
  const previewVideos = videos.slice(0, VIDEO_PREVIEW_COUNT);

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
    <main className="flex flex-1 flex-col bg-secondary overflow-y-auto">
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

      <div className="container mx-auto px-4 sm:px-6 py-10 max-w-3xl">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{country}</h1>
          <p className="text-sm text-gray-500 mb-5">
            <span className="font-semibold text-primary">{locations.length}</span> miejsc ·{' '}
            <span className="font-semibold text-primary">{videos.length}</span> odcinków
          </p>
          <p className="text-gray-700 mb-6">
            Robert Makłowicz odwiedził co najmniej <strong>{locations.length}</strong> miejsc w {countryLoc} — restauracje, atrakcje, miejsca historyczne i więcej. Przeglądaj je na interaktywnej mapie lub liście z filtrami.
          </p>
          <CountryMiniMap locations={locations} country={country} />
        </div>

        {/* Preview cards */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Miejsca w {countryLoc}</h2>
          <div className="flex flex-col gap-3">
            {previewLocations.map((loc) => (
              <LocationCard key={loc.id} loc={loc} country={country} />
            ))}
          </div>
        </section>

        {/* Mid-page CTA */}
        {remaining > 0 && (
          <a
            href={`/?country=${encodeURIComponent(country)}`}
            className="flex items-center justify-between w-full px-5 py-4 rounded-2xl border-2 border-primary/20 bg-white hover:border-primary/40 hover:shadow-md transition-all mb-10 group"
          >
            <span className="text-primary font-semibold">
              ...i jeszcze <strong>{remaining}</strong> miejsc w {countryLoc}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-4 py-2 rounded-lg group-hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0">
              <MapIcon className="w-4 h-4" />
              Otwórz mapę
            </span>
          </a>
        )}

        {/* Videos */}
        {previewVideos.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-primary mb-4">Odcinki z {countryLoc} ({videos.length})</h2>
            <div className="flex flex-col gap-3">
              {previewVideos.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}
            </div>
            {videos.length > VIDEO_PREVIEW_COUNT && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                + {videos.length - VIDEO_PREVIEW_COUNT} więcej odcinków —{' '}
                <a href={`/?country=${encodeURIComponent(country)}`} className="text-primary font-medium underline underline-offset-2">
                  filtruj na mapie
                </a>
              </p>
            )}
          </section>
        )}

        {/* Full SEO location list */}
        <section>
          <h2 className="text-base font-semibold text-gray-500 mb-3">Wszystkie miejsca ({locations.length})</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            {locations.map((loc) => (
              <li key={loc.id}>
                <a
                  href={`/?country=${encodeURIComponent(country)}&placeId=${encodeURIComponent(loc.id)}`}
                  className="text-xs text-gray-500 hover:text-primary transition-colors line-clamp-1"
                >
                  {loc.name}
                </a>
              </li>
            ))}
          </ul>
        </section>

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
