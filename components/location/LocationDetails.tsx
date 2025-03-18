import { Location } from '../../types/Location';
import LocationIcon from './LocationIcon';
import locationData from '../../data/locations.json';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationDetails({ location, onClose }: LocationDetailsProps) {

  const video = locationData.videos.find(v => 
    v.locations.some(loc => loc.id === location?.id)
  );
  const videoUrl = video?.videoUrl;

  return (
    <aside 
      className={`fixed md:top-[116px] bottom-0 right-0 w-full md:w-96 bg-white shadow-xl
        h-[85vh] md:h-[calc(100vh-116px)] max-h-screen
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

        {location && (
          <>
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
          </>
        )}
      </div>
    </aside>
  );
}
