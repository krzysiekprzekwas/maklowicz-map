import { Location } from '../../types/Location';

interface LocationDetailsProps {
  location: Location | null;
  onClose: () => void;
}

export function LocationDetails({ location, onClose }: LocationDetailsProps) {
  if (!location) return null;

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

        <h2 className="text-2xl font-bold mb-4 pr-8">{location.name}</h2>
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
        </div>
      </div>
    </aside>
  );
} 