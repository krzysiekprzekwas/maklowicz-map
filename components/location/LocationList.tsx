import { useState, useRef, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';

const ITEMS_PER_PAGE = 10;

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
  const isMobilePaginated = !!topPadding;
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const totalPages = isMobilePaginated ? Math.max(1, Math.ceil(locations.length / ITEMS_PER_PAGE)) : 1;

  // Reset to page 1 when locations change (filters applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [locations.length, selectedCountry, isNearby]);

  const visibleLocations = useMemo(() => {
    if (!isMobilePaginated) return locations;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return locations.slice(start, start + ITEMS_PER_PAGE);
  }, [locations, currentPage, isMobilePaginated]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    scrollRef.current?.scrollTo({ top: 0 });
  };

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
        <div ref={scrollRef} className="h-full overflow-y-auto pt-1 pb-20">
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
            visibleLocations.map(loc => (
              <LocationListItem key={loc.id} location={loc} onClick={onLocationSelect} />
            ))
          )}

          {/* Pagination — mobile only */}
          {isMobilePaginated && totalPages > 1 && locations.length > 0 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
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

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    const items: (number | '...')[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      // Always show first few pages around current, plus last
      const show = new Set<number>();
      show.add(1);
      show.add(totalPages);
      for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 2); i++) {
        show.add(i);
      }
      const sorted = Array.from(show).sort((a, b) => a - b);
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) items.push('...');
        items.push(sorted[i]);
      }
    }
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-1 py-6 px-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-1000 disabled:opacity-30"
        aria-label="Poprzednia strona"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-1 mx-2">
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-8 text-center text-sm text-neutral-300">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-neutral-1000 text-neutral-0'
                  : 'text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-1000 disabled:opacity-30"
        aria-label="Następna strona"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
