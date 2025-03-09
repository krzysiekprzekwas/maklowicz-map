import { Location } from '../../types/Location';
import locationData from '../../data/locations.json';

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

  const typeIcon = location.type === 'restaurant' ? '🍴' : 
                  location.type === 'attraction' ? '🏛️' : '📍';

  return (
    <aside 
      className={`fixed top-[116px] right-0 h-[calc(100vh-116px)] w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        location ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Zamknij szczegóły"
        >
          <span className="text-gray-500 text-xl">×</span>
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{typeIcon}</span>
          <h2 className="text-2xl font-bold pr-8">{location.name}</h2>
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
        </div>
      </div>
    </aside>
  );
} 