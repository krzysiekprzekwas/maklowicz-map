import React from 'react';
import { SlidersHorizontal, X, MapPin } from 'lucide-react';
import { Location } from '../../types/Location';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';
import { LocationListItem } from './LocationListItem';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  selectedCountry: string | null;
  selectedLocationTypes: string[];
  filteredCount: number;
  hasActiveFilters: boolean;
  locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
  nearbyRadius: number;
  onToggleFilters: () => void;
  onRemoveCountry: () => void;
  onRemoveLocationType: (type: string) => void;
  onClearFilters: () => void;
  onClearNearby: () => void;
}

function pluralMiejsc(n: number) {
  if (n === 1) return 'miejsce';
  if (n >= 2 && n <= 4) return 'miejsca';
  return 'miejsc';
}

export function LocationList({
  locations,
  onLocationSelect,
  selectedCountry,
  selectedLocationTypes,
  filteredCount,
  hasActiveFilters,
  locationStatus,
  nearbyRadius,
  onToggleFilters,
  onRemoveCountry,
  onRemoveLocationType,
  onClearFilters,
  onClearNearby,
}: LocationListProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-secondary-border shadow-sm">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          {/* Scrollable filter chips */}
          <div
            className="flex-1 flex gap-2 overflow-x-auto min-w-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
          >
            {!hasActiveFilters && (
              <span className="text-sm text-gray-400 py-1 whitespace-nowrap">Wszystkie miejsca</span>
            )}
            {locationStatus === 'granted' && (
              <button
                onClick={onClearNearby}
                className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs whitespace-nowrap flex-shrink-0"
              >
                <MapPin className="h-3 w-3" />
                {nearbyRadius} km
                <X className="h-3 w-3" />
              </button>
            )}
            {locationStatus !== 'granted' && selectedCountry && (
              <button
                onClick={onRemoveCountry}
                className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs whitespace-nowrap flex-shrink-0"
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
                  onClick={() => onRemoveLocationType(type)}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs whitespace-nowrap flex-shrink-0"
                >
                  {label}
                  <X className="h-3 w-3" />
                </button>
              );
            })}
          </div>

          {/* Filters button */}
          <button
            onClick={onToggleFilters}
            aria-label="Zmień filtry"
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              hasActiveFilters ? 'bg-primary text-secondary' : 'bg-secondary text-primary'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 px-4 pb-2">
          {filteredCount.toLocaleString('pl-PL')} {pluralMiejsc(filteredCount)}
        </p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-20">
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
