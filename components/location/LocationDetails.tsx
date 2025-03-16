import { Location } from '../../types/Location';
import locationData from '../../data/locations.json';
import LocationIcon from './LocationIcon';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationDetails({ location, onClose }: LocationDetailsProps) {
  if (!location) return null;

  const video = locationData.videos.find(v => 
    v.locations.some(loc => loc.id === location.id)
  );
  const videoUrl = video?.videoUrl;

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          location ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Details Panel */}
      <aside 
        className={`fixed md:top-[116px] bottom-0 right-0 w-full md:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out 
          h-[85vh] md:h-[calc(100vh-116px)] max-h-screen
          ${location ? 'translate-x-0' : 'translate-x-full'} 
          ${location ? 'md:translate-x-0 translate-y-0' : 'md:translate-x-full translate-y-full'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="p-6 relative h-full overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Zamknij szczegóły"
          >
            <span className="text-gray-500 text-xl">×</span>
          </button>

          {/* Mobile Handle */}
          <div className="md:hidden w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl"><LocationIcon location={location} /></span>
            <h2 className="text-xl md:text-2xl font-bold pr-8">{location.name}</h2>
          </div>
          <p className="text-gray-600 mb-4">{location.description}</p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Adres</h3>
              <p>{location.address}</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-1">Kraj</h3>
              <p>{location.country}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Typ miejsca</h3>
              <p className="capitalize">{location.type}</p>
            </div>

            {video && (
              <div>
                <h3 className="font-semibold mb-1">Film</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{video.title}</p>
                  <a 
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary-darker transition-colors"
                  >
                    <span>▶️ Zobacz na YouTube</span>
                  </a>
                </div>
              </div>
            )}

            {location.GoogleMapsLink && (
              <div>
                <h3 className="font-semibold mb-1">Google Maps</h3>
                <a href={location.GoogleMapsLink} target="_blank" rel="noopener noreferrer">
                  <span>🗺️ Otwórz w Google Maps</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
} 