import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Search, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';
import { Location } from '../../types/Location';
import { LocationListItem } from './LocationListItem';

interface LocationListProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  onClearFilters: () => void;
  // Inline filter panel (desktop)
  showInlineFilters?: boolean;
  filteredCount?: number;
  selectedCountry?: string | null;
  selectedLocationTypes?: string[];
  locationStatus?: 'idle' | 'loading' | 'granted' | 'denied';
  nearbyRadius?: number;
  countries?: { name: string; count: number }[];
  onCountrySelect?: (country: string | null) => void;
  onToggleLocationType?: (type: string) => void;
  onClearNearby?: () => void;
  onRequestLocation?: () => void;
  onSetNearbyRadius?: (radius: number) => void;
  onClearLocationTypes?: () => void;
}

export function LocationList({
  locations,
  onLocationSelect,
  onClearFilters,
  showInlineFilters,
  filteredCount,
  selectedCountry,
  selectedLocationTypes = [],
  locationStatus,
  nearbyRadius,
  countries = [],
  onCountrySelect,
  onToggleLocationType,
  onClearNearby,
  onRequestLocation,
  onSetNearbyRadius,
  onClearLocationTypes,
}: LocationListProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = chipsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = chipsScrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', updateScrollState); ro.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInlineFilters]);

  const scrollChips = (dir: 'left' | 'right') => {
    chipsScrollRef.current?.scrollBy({ left: dir === 'right' ? 160 : -160, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCountryDropdownOpen]);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-full min-h-0 bg-white">
      {showInlineFilters && (
        <div className="sticky top-0 z-10 bg-white border-b border-secondary-border flex-shrink-0">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <span className="font-bold text-primary text-lg">Lokalizacje</span>
            <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-medium">
              {filteredCount?.toLocaleString('pl-PL')} Miejsc
            </span>
          </div>

          {/* Type filter chips — horizontal scroll with arrow navigation */}
          <div className="relative pb-3">
            <div
              ref={chipsScrollRef}
              className="flex gap-2 overflow-x-auto px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              <button
                onClick={onClearLocationTypes}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedLocationTypes.length === 0
                    ? 'bg-primary text-secondary border-primary'
                    : 'border-secondary-border text-primary hover:bg-secondary'
                }`}
              >
                Wszystkie
              </button>
              {LOCATION_TYPES.map(({ type, label, icon: Icon }) => {
                const active = selectedLocationTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleLocationType?.(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border whitespace-nowrap flex-shrink-0 transition-colors ${
                      active
                        ? 'bg-primary text-secondary border-primary'
                        : 'border-secondary-border text-primary hover:bg-secondary'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Left fade + arrow — top-0 bottom-3 excludes pb-3 so items-center aligns with chips */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-3 z-10 flex items-center pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
                <button
                  onClick={() => scrollChips('left')}
                  className="relative ml-1 w-7 h-7 bg-white border border-secondary-border rounded-full shadow-sm flex items-center justify-center pointer-events-auto hover:bg-secondary transition-colors"
                  aria-label="Przewiń w lewo"
                >
                  <ChevronLeft className="h-4 w-4 text-primary" />
                </button>
              </div>
            )}

            {/* Right fade + arrow */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-3 z-10 flex items-center pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-l from-white via-white/80 to-transparent" />
                <button
                  onClick={() => scrollChips('right')}
                  className="relative mr-1 w-7 h-7 bg-white border border-secondary-border rounded-full shadow-sm flex items-center justify-center pointer-events-auto hover:bg-secondary transition-colors"
                  aria-label="Przewiń w prawo"
                >
                  <ChevronRight className="h-4 w-4 text-primary" />
                </button>
              </div>
            )}
          </div>

          {/* Country / nearby search */}
          <div className="px-4 pb-3">
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center border border-secondary-border rounded-lg px-3 py-2.5 gap-2 bg-white">
                {locationStatus === 'loading'
                  ? <Loader2 className="h-4 w-4 animate-spin text-gray-400 flex-shrink-0" />
                  : locationStatus === 'granted'
                    ? <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    : <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                }
                <input
                  type="text"
                  readOnly={locationStatus === 'loading' || locationStatus === 'granted'}
                  className="flex-1 text-sm text-primary outline-none bg-transparent placeholder-gray-400"
                  placeholder="Szukaj w danym regionie"
                  value={
                    locationStatus === 'loading' ? 'Uzyskiwanie lokalizacji…' :
                    locationStatus === 'granted' ? 'Moja lokalizacja' :
                    selectedCountry && !isCountryDropdownOpen ? selectedCountry : countrySearch
                  }
                  onMouseDown={(e) => {
                    if (locationStatus === 'loading') { e.preventDefault(); return; }
                    if (isCountryDropdownOpen) {
                      e.preventDefault();
                      setIsCountryDropdownOpen(false);
                    }
                  }}
                  onFocus={() => {
                    if (locationStatus === 'loading') return;
                    if (locationStatus === 'granted') {
                      onClearNearby?.();
                      setIsCountryDropdownOpen(true);
                      return;
                    }
                    setCountrySearch('');
                    setIsCountryDropdownOpen(true);
                  }}
                  onChange={e => {
                    setCountrySearch(e.target.value);
                    setIsCountryDropdownOpen(true);
                    if (!e.target.value) onCountrySelect?.(null);
                  }}
                />
                {(selectedCountry || locationStatus === 'granted') && (
                  <button
                    onClick={locationStatus === 'granted' ? onClearNearby : () => { onCountrySelect?.(null); setCountrySearch(''); setIsCountryDropdownOpen(false); }}
                    aria-label="Wyczyść"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-primary" />
                  </button>
                )}
              </div>
              {isCountryDropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-secondary-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { setIsCountryDropdownOpen(false); onRequestLocation?.(); }}
                    className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-secondary flex items-center gap-2"
                  >
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="flex-1">Moja lokalizacja</span>
                    {locationStatus === 'denied' && <span className="text-xs text-red-500">Brak dostępu</span>}
                  </button>
                  <div className="border-t border-secondary-border mx-2" />
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map(c => (
                      <button
                        key={c.name}
                        onClick={() => { onCountrySelect?.(c.name); setCountrySearch(''); setIsCountryDropdownOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-secondary flex justify-between items-center"
                      >
                        <span>{c.name}</span>
                        <span className="text-xs text-gray-400">({c.count})</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-400">Brak wyników</div>
                  )}
                </div>
              )}
            </div>
            {/* Radius slider */}
            {locationStatus === 'granted' && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Zasięg</span><span>{nearbyRadius} km</span>
                </div>
                <input
                  type="range" min={10} max={100} step={5} value={nearbyRadius}
                  onChange={e => onSetNearbyRadius?.(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>10 km</span><span>100 km</span>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto pt-1 pb-20">
        {!showInlineFilters && <div className="h-20" />}
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
