import { Location } from '../../types/Location';
import LocationIcon from './LocationIcon';
import locationData from '../../data/locations.json';
import { MapPin, Heart, Share2, TvMinimalPlay, Info, Flag } from "lucide-react";
import { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
  favouriteLocationIds: string[];
  addFavouriteLocation: (id: string) => void;
  removeFavouriteLocation: (id: string) => void;
}

function translateLocationType(type: string): string {
  switch (type.toLowerCase()) {
    case "restaurant":
      return "Restauracja";
    case "attraction":
      return "Atrakcja";
    case "other":
    default:
      return "Inne";
  }
}

export function LocationDetails({ 
  location, 
  onClose,
  favouriteLocationIds,
  addFavouriteLocation,
  removeFavouriteLocation,
}: LocationDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  const video = locationData.videos.find(v => 
    v.locations.some(loc => loc.id === location?.id)
  );
  
  useEffect(() => {
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); 
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  useEffect(() => {
    if (!location) return;
    
    setIsFavorite(favouriteLocationIds.includes(location.id));
  }, [location, favouriteLocationIds]);

  const toggleFavorite = () => {
    if (!location) return;
    
    if (isFavorite) {
      // Remove from favorites
      removeFavouriteLocation(location.id);
      setIsFavorite(false);
    } else {
      // Add to favorites
      addFavouriteLocation(location.id);
      setIsFavorite(true);
    }
  };

  // Content for both desktop and mobile views
  const detailsContent = location && (
    <>
      <div className="flex items-center gap-2 mb-4">
        <h2 className={`text-xl md:text-2xl font-bold pr-8 ${location.isFilteredOut ? 'text-gray-400' : ''}`}>{location.name}</h2>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className={`flex items-center gap-1 bg-${location.type} text-${location.type}-text text-sm font-semibold border border-${location.type}-border rounded-full px-2`}>
          <LocationIcon type={location.type} />
          {translateLocationType(location.type)}
        </div>
        <div className="flex items-center gap-1 bg-secondary text-sm font-semibold border border-secondary-border rounded-full px-2">
          <Flag className="h-4 w-4"/>
          {location.country}
        </div>
      </div>

      {location.image && (
        <div className="mb-4 rounded-lg overflow-hidden border border-secondary-border relative">
          {isImageLoading && (
            <div className="absolute inset-0 bg-secondary animate-pulse" />
          )}
          <img 
            src={location.image} 
            alt={location.name} 
            className={`w-full h-auto object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-4">
          <div className="bg-secondary border border-secondary-border rounded-lg p-4">
            <h3 className="font-bold text-primary mb-2">Opis</h3>
            <p className="text-gray-600">{location.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary border border-secondary-border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-primary mr-2" />
                <h3 className="font-bold text-primary text-sm">Adres</h3>
              </div>
              <p className="text-sm mb-3">
                {location.address}
              </p>
              <a
                href={location.GoogleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-white border border-secondary-border text-xs text-primary rounded-lg py-1"
              >
                Google Maps
              </a>
            </div>

            <div className="bg-secondary border border-secondary-border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <TvMinimalPlay className="h-4 w-4 text-primary mr-2" />
                <h3 className="font-bold text-primary text-sm">Odcinek</h3>
              </div>
              <p className="text-sm mb-3">{video.filterTitle}</p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-red-600 hover:bg-red-700 border text-xs transition-all text-white rounded-lg py-1"
              >
                YouTube
              </a>
            </div>
          </div>
          
          <div className="bg-secondary border border-secondary-border rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="h-4 w-4 text-primary mr-2" />
              <h3 className="font-bold text-primary text-sm">Szczegóły</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-secondary-border">
                  <td className="text-gray-500">Data odcinka:</td>
                  <td>{video.date}</td>
                </tr>
                {location.websiteUrl && (
                  <tr className="border-b border-secondary-border">
                    <td className="text-gray-500">Strona miejsca:</td>
                    <td>
                      <a
                        href={location.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {location.websiteUrl}
                      </a>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="text-gray-500">Pełna nazwa odcinka:</td>
                  <td>{video.title}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button 
            className={`flex items-center justify-center ${
              isFavorite 
                ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white' 
                : 'bg-white border-red-200 hover:border-red-500 text-red-600'
            } border text-xs rounded-lg py-2 px-2 transition-all`}
            onClick={toggleFavorite}
          >
            <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-white text-white' : ''}`} />
            {isFavorite ? 'Ulubione' : 'Dodaj do ulubionych'}
          </button>

          <button 
            className="flex items-center justify-center bg-white border border-secondary-border hover:border-primary text-xs text-primary rounded-lg py-2 px-2"
            onClick={() => navigator.share?.({
              title: location.name,
              text: `Sprawdź to miejsce: ${location.name}`,
              url: location.GoogleMapsLink || window.location.href,
            })}
            disabled={!navigator.share}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Udostępnij
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop View */}
      {!isMobile && (
        <aside 
          className={`fixed md:top-[116px] bottom-0 right-0 md:w-96 bg-white shadow-xl
            h-[calc(100vh-116px)] max-h-screen
            transform transition-all duration-300 ease-in-out
            ${location ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
          style={{ zIndex: 9999 }}
        >
          <div className="p-6 relative h-full overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Zamknij szczegóły"
            >
              <span className="text-gray-500 text-xl">x</span>
            </button>

            {detailsContent}
          </div>
        </aside>
      )}

      {/* Mobile View with react-modal-sheet */}
      {isMobile && (
        <Sheet
          isOpen={!!location}
          onClose={onClose}
          detent="content-height"
        >
          <Sheet.Container>
            <Sheet.Header/>
            <Sheet.Content>
              <div className="p-6 relative h-full overflow-y-auto">
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