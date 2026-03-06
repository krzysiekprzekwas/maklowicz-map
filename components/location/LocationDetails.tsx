import { Location } from '../../types/Location';
import locationData from '../../data/locations.json';
import { Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { TYPE_META } from '../../src/lib/locationTypeMeta';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationDetails({
  location,
  onClose,
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
      {/* Title + close */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-primary leading-tight">{location.name}</h2>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors mt-0.5"
          aria-label="Zamknij"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Image */}
      {location.image && (
        <div className="mb-4 rounded-xl overflow-hidden relative bg-secondary aspect-video">
          {isImageLoading && (
            <div className="absolute inset-0 bg-secondary animate-pulse" />
          )}
          <img
            src={location.image}
            alt={location.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>
      )}

      {/* Type + country pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-secondary-border bg-secondary text-primary">
          <TypeIcon className="h-3.5 w-3.5" />
          {typeMeta.label}
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border border-secondary-border bg-secondary text-primary">
          {location.country}
        </span>
      </div>

      {/* Opis */}
      <section className="pb-5">
        <h3 className="font-bold text-primary mb-2">Opis</h3>
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
            >
              {video.filterTitle}
            </a>
          </section>
          <hr className="border-secondary-border mb-5" />
        </>
      )}

      {/* Action buttons */}
      <div className="pb-6">
        <button
          onClick={() => navigator.share?.({
            title: location.name,
            text: `Sprawdź to miejsce: ${location.name}`,
            url: `/?placeId=${encodeURIComponent(location.id)}`,
          })}
          disabled={typeof navigator !== 'undefined' && !navigator.share}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-secondary-border bg-white text-primary text-sm hover:border-primary transition-colors disabled:opacity-40"
        >
          <Share2 className="h-4 w-4 flex-shrink-0" />
          Udostępnij
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className={`fixed md:top-[116px] bottom-0 right-0 md:w-96 bg-white shadow-xl
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
