import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onClearFilters: () => void;
}

export function LocationList({ locations, onLocationSelect, onClearFilters }: LocationListProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-white">
      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-1 pb-20">
        <div className="h-20" />
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
            <p className="text-sm">Brak miejsc spełniających kryteria</p>
            <button
              onClick={onClearFilters}
              className="text-sm text-primary underline underline-offset-2"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          locations.map(loc => (
            <LocationListItem key={loc.id} location={loc} onClick={onLocationSelect} />
          ))
        )}
      </div>
    </div>
  );
}
