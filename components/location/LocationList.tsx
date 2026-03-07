import { MapPin, SlidersHorizontal, X } from 'lucide-react';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';
import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onClearFilters: () => void;
  onToggleFilters?: () => void;
  hasActiveFilters?: boolean;
  filteredCount?: number;
  selectedCountry?: string | null;
  selectedLocationTypes?: string[];
  locationStatus?: 'idle' | 'loading' | 'granted' | 'denied';
  nearbyRadius?: number;
  onCountrySelect?: (country: string | null) => void;
  onToggleLocationType?: (type: string) => void;
  onClearNearby?: () => void;
}

export function LocationList({
  locations,
  onLocationSelect,
  onClearFilters,
  onToggleFilters,
  hasActiveFilters,
  filteredCount,
  selectedCountry,
  selectedLocationTypes = [],
  locationStatus,
  nearbyRadius,
  onCountrySelect,
  onToggleLocationType,
  onClearNearby,
}: LocationListProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-white">
      {onToggleFilters ? (
        <div className="sticky top-0 z-10 bg-white border-b border-secondary-border flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">{filteredCount} miejsc</span>
            <button
              onClick={onToggleFilters}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                hasActiveFilters ? 'bg-primary text-secondary' : 'bg-secondary text-primary'
              }`}
              aria-label="Filtry"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {locationStatus === 'granted' ? (
                <button
                  onClick={onClearNearby}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs"
                >
                  <MapPin className="h-3 w-3" />
                  {nearbyRadius} km
                  <X className="h-3 w-3" />
                </button>
              ) : selectedCountry && (
                <button
                  onClick={() => onCountrySelect?.(null)}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs"
                >
                  {selectedCountry}
                  <X className="h-3 w-3" />
                </button>
              )}
              {selectedLocationTypes.map(type => {
                const label = LOCATION_TYPES.find(t => t.type === type)?.label ?? type;
                return (
                  <button
                    key={type}
                    onClick={() => onToggleLocationType?.(type)}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs"
                  >
                    {label}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-1 pb-20">
        {!onToggleFilters && <div className="h-20" />}
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
