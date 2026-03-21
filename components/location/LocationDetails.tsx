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

  // Reset image loading state when location changes
  useEffect(() => {
    setIsImageLoading(true);
  }, [location?.id]);

  const typeMeta = TYPE_META[location?.type ?? ''] ?? TYPE_META.tourist_attraction;
  const TypeIcon = typeMeta.icon;

  const detailsContent = location && (
    <>
      {/* Image with X overlay, or standalone X when no image */}
      {location.image ? (
        <div className="mb-4 -mx-6 -mt-6 relative bg-secondary aspect-video">
          {isImageLoading && (
            <div className="absolute inset-0 bg-secondary animate-pulse" />
          )}
          <img
            src={location.image}
            alt={location.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />
          {/* Bottom-left: type + country badges */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-primary shadow-sm">
              <TypeIcon className="h-3 w-3" />
              {typeMeta.label}
            </span>
            <span className="flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 text-primary shadow-sm">
              {location.country}
            </span>
          </div>

          {/* Top-right: share + close */}
          <button
            onClick={() => {
              trackShare(location.id);
              navigator.share?.({
                title: location.name,
                text: `Sprawdź to miejsce: ${location.name}`,
                url: `/?placeId=${encodeURIComponent(location.id)}`,
              });
            }}
            disabled={typeof navigator !== 'undefined' && !navigator.share}
            className="absolute top-3 right-12 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm disabled:hidden"
            aria-label="Udostępnij"
          >
            <Share2 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      ) : (
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-primary leading-tight mb-4">{location.name}</h2>

      {/* Type + country pills — only shown when there's no image (otherwise they're image overlays) */}
      {!location.image && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-secondary-border bg-secondary text-primary">
            <TypeIcon className="h-3.5 w-3.5" />
            {typeMeta.label}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-secondary-border bg-secondary text-primary">
            {location.country}
          </span>
        </div>
      )}

      {/* Opis */}
      <section className="pb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-primary">Opis</h3>
          {onShowOnMap && (
            <button
              onClick={onShowOnMap}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-primary bg-white text-primary hover:bg-secondary transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Pokaż na mapie
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{location.description}</p>
      </section>
      <hr className="border-secondary-border mb-5" />

      {/* Adres */}
      <section className="pb-5">
        <h3 className="font-bold text-primary mb-2">Adres</h3>
        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{location.address}</p>
        {location.GoogleMapsLink && (
          <a
            href={location.GoogleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary underline underline-offset-2"
            onClick={() => trackOutboundLink('google_maps', location.name)}
          >
            Znajdź lokalizację na Google Maps
          </a>
        )}
      </section>
      <hr className="border-secondary-border mb-5" />

      {/* Miejsce z odcinka */}
      {video && (
        <>
          <section className="pb-5">
            <h3 className="font-bold text-primary mb-2">Miejsce z odcinka</h3>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary underline underline-offset-2"
              onClick={() => trackOutboundLink('youtube', location.name)}
            >
              {video.filterTitle}
            </a>
          </section>
          <hr className="border-secondary-border mb-5" />
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
          className={`fixed md:top-[116px] bottom-0 right-0 md:w-96 bg-white shadow-xl rounded-tl-2xl overflow-hidden
            h-[calc(100vh-116px)] max-h-screen
            transform transition-all duration-300 ease-in-out
            ${location ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
          style={{ zIndex: 9999 }}
        >
          <div className="p-6 h-full overflow-y-auto">
            {detailsContent}
          </div>
        </aside>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <Sheet
          isOpen={!!location}
          onClose={onClose}
          detent="content-height"
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content>
              <div className="p-6 max-h-[85vh] overflow-y-auto">
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
