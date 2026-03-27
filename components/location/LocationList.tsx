import { X } from 'lucide-react';
import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onClearFilters: () => void;
  filteredCount?: number;
  selectedCountry?: string | null;
  /** Add top padding to clear the absolute-positioned filter bar (mobile list) */
  topPadding?: boolean;
  /** Active location type filters — shown as removable tags */
  selectedLocationTypes?: string[];
  onToggleLocationType?: (type: string) => void;
  /** Whether nearby geolocation is active */
  isNearby?: boolean;
}

export function LocationList({
  locations,
  onLocationSelect,
  onClearFilters,
  filteredCount,
  selectedCountry,
  topPadding,
  selectedLocationTypes = [],
  onToggleLocationType,
  isNearby,
}: LocationListProps) {
  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-bg-primary">
      {/* Spacer for mobile filter bar */}
      {topPadding && <div className="h-20 flex-shrink-0" />}

      <div className="px-4 pt-4 pb-3 flex-shrink-0 space-y-2">
        {/* Heading */}
        <h2 className="font-bold text-neutral-1000 text-lg">Lista lokacji</h2>

        {/* Active filter tags */}
        {selectedLocationTypes.length > 0 && onToggleLocationType && (
          <div className="flex flex-wrap gap-1.5">
            {selectedLocationTypes.map(type => {
              const meta = LOCATION_TYPES.find(lt => lt.type === type);
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  onClick={() => onToggleLocationType(type)}
                  className="flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-full text-xs bg-neutral-200 text-neutral-1000"
                >
                  <Icon className="h-3 w-3 text-neutral-1000" />
                  <span>{meta.label}</span>
                  <X className="h-3 w-3 text-neutral-1000" />
                </button>
              );
            })}
          </div>
        )}

        {/* Country / nearby + count */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-1000 text-sm">
            {isNearby ? 'Niedaleko Ciebie' : selectedCountry || 'Wszystkie'}
          </span>
          <span className="text-sm text-neutral-500">
            <span className="font-semibold text-neutral-1000">{filteredCount?.toLocaleString('pl-PL')}</span> miejsca
          </span>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="relative flex-1 min-h-0">
        <div className="h-full overflow-y-auto pt-1 pb-20">
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
        {/* Bottom fade */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #F6F5F2, transparent)' }}
        />
      </div>
    </div>
  );
}
