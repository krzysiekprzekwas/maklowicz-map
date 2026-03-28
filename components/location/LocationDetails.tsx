import { Location } from '../../types/Location';
import locationData from '../../data/locations.json';
import { MapPin, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { TYPE_META } from '../../src/lib/locationTypeMeta';
import { trackShare, trackOutboundLink } from '../../src/lib/analytics';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
  onShowOnMap?: () => void;
}

export function LocationDetails({
  location,
  onClose,
  onShowOnMap,
}: LocationDetailsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const video = locationData.videos.find(v =>
    v.locations.some(loc => loc.id === location?.id)
  );

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    setIsImageLoading(true);
  }, [location?.id]);

  const typeMeta = TYPE_META[location?.type ?? ''] ?? TYPE_META.tourist_attraction;
  const TypeIcon = typeMeta.icon;

  const detailsContent = location && (
    <>
      {/* Hero image — inset with rounded corners, share/X overlaid */}
      {location.image ? (
        <div className="mb-3 relative">
          {isImageLoading && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse rounded-xl" />
          )}
          <img
            src={location.image}
            alt={location.name}
            className={`w-full aspect-video object-cover rounded-xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />
          {/* Share + close on image */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={() => {
                trackShare(location.id);
                navigator.share?.({
                  title: location.name,
                  text: `Sprawdź to miejsce: ${location.name}`,
                  url: `/map?placeId=${encodeURIComponent(location.id)}`,
                }).catch(() => {});
              }}
              disabled={typeof navigator !== 'undefined' && !navigator.share}
              className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-neutral-0/80 hover:bg-neutral-0 transition-colors shadow-sm disabled:hidden"
              aria-label="Udostępnij"
            >
              <Share2 className="h-5 w-5 text-neutral-500" />
            </button>
            <button
              onClick={onClose}
              className="w-[42px] h-[42px] flex items-center justify-center rounded-full bg-neutral-0/80 hover:bg-neutral-0 transition-colors shadow-sm"
              aria-label="Zamknij"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="w-[42px] h-[42px] flex items-center justify-center rounded-full hover:bg-neutral-200 transition-colors"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4 text-neutral-300" />
          </button>
        </div>
      )}

      {/* Pill badges — below image */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-accent-pink/30 text-neutral-1000">
          <TypeIcon className="h-3 w-3" />
          {typeMeta.label}
        </span>
        <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent-pink/30 text-neutral-1000">
          {location.country}
        </span>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-neutral-1000 leading-tight mb-3">{location.name}</h2>

      {/* Description */}
      <p className="text-sm text-neutral-500 leading-relaxed mb-5">{location.description}</p>

      {/* Show on map button — outline style */}
      {onShowOnMap && (
        <button
          onClick={onShowOnMap}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-neutral-300 text-neutral-1000 bg-neutral-0 hover:bg-bg-primary transition-colors mb-5"
        >
          <MapPin className="h-4 w-4" />
          Zobacz na mapie
        </button>
      )}

      <hr className="border-neutral-200 mb-4" />

      {/* Address */}
      <section className="mb-4">
        <h3 className="flex items-center gap-2 font-semibold text-neutral-1000 text-sm mb-1.5">
          <img src="/icons/pin.svg" alt="" className="h-5 w-5" />
          Adres
        </h3>
        <p className="text-sm text-neutral-900 leading-relaxed">{location.address}</p>
        {location.GoogleMapsLink && (
          <a
            href={location.GoogleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-accent-blue font-semibold underline underline-offset-2 hover:text-accent-blue/80"
            onClick={() => trackOutboundLink('google_maps', location.name)}
          >
            Zobacz lokalizację na Google Maps
          </a>
        )}
      </section>

      {/* Video link */}
      {video && (
        <>
          <hr className="border-neutral-200 mb-4" />
          <section className="mb-4">
            <h3 className="flex items-center gap-2 font-semibold text-neutral-1000 text-sm mb-1.5">
              <img src="/icons/youtube.svg" alt="" className="h-5 w-5" />
              Miejsce z odcinka
            </h3>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent-blue font-semibold underline underline-offset-2 hover:text-accent-blue/80"
              onClick={() => trackOutboundLink('youtube', location.name)}
            >
              {video.filterTitle}
            </a>
          </section>
        </>
      )}

      <div className="pb-6" />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className={`absolute top-0 bottom-0 right-0 md:w-96 bg-bg-primary shadow-xl overflow-hidden
            h-full
            transform transition-all duration-300 ease-in-out
            ${location ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
          style={{ zIndex: 9999 }}
        >
          <div className="p-5 h-full overflow-y-auto">
            {detailsContent}
          </div>
        </aside>
      )}

      {/* Mobile bottom sheet — covers navbar */}
      {isMobile && (
        <Sheet
          isOpen={!!location}
          onClose={onClose}
          detent="full-height"
          style={{ zIndex: 10001 }}
        >
          <Sheet.Container className="!bg-bg-primary">
            <Sheet.Header className="!bg-bg-primary" />
            <Sheet.Content>
              <div className="p-5 max-h-[85vh] overflow-y-auto bg-bg-primary">
                {detailsContent}
              </div>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={onClose} />
        </Sheet>
      )}
    </>
  );
}
