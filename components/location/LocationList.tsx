import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onClearFilters: () => void;
  filteredCount?: number;
  selectedCountry?: string | null;
}

export function LocationList({
  locations,
  onLocationSelect,
  onClearFilters,
  filteredCount,
  selectedCountry,
}: LocationListProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-bg-primary">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <span className="font-bold text-neutral-1000 text-lg">
          {selectedCountry || 'Lokalizacje'}
        </span>
        <span className="text-sm text-neutral-500">
          <span className="font-semibold text-neutral-1000">{filteredCount?.toLocaleString('pl-PL')}</span> miejsc
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-1 pb-20">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-neutral-300 gap-3">
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
