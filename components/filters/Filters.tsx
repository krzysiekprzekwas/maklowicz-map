import { useEffect, useRef, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import { X, SlidersHorizontal, Search, MapPin, Loader2, Check } from 'lucide-react';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';

interface FiltersProps {
  isOpen: boolean;
  countries: { name: string; count: number }[];
  selectedCountry: string | null;
  selectedLocationTypes: string[];
  filteredCount: number;
  locationTypeCounts: Record<string, number>;
  locationStatus: 'idle' | 'loading' | 'granted' | 'denied';
  nearbyRadius: number;
  onCountrySelect: (country: string | null) => void;
  onToggleLocationType: (type: string) => void;
  onToggleFilters: () => void;
  onResetFilters: () => void;
  onRequestLocation: () => void;
  onSetNearbyRadius: (radius: number) => void;
  onClearNearby: () => void;
}

export function Filters({
  isOpen,
  countries,
  selectedCountry,
  selectedLocationTypes,
  filteredCount,
  locationTypeCounts,
  locationStatus,
  nearbyRadius,
  onCountrySelect,
  onToggleLocationType,
  onToggleFilters,
  onResetFilters,
  onRequestLocation,
  onSetNearbyRadius,
  onClearNearby,
}: FiltersProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isCountryDropdownOpenDesktop, setIsCountryDropdownOpenDesktop] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    if (!isCountryDropdownOpenDesktop) return;
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsCountryDropdownOpenDesktop(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCountryDropdownOpenDesktop]);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node))
        setIsCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCountryDropdownOpen]);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  function pluralMiejsc(n: number) {
    if (n === 1) return 'miejsce';
    if (n >= 2 && n <= 4) return 'miejsca';
    return 'miejsc';
  }

  const hasActiveFilters =
    !!selectedCountry ||
    selectedLocationTypes.length > 0 ||
    locationStatus === 'granted';

  const hasActiveTypeFilters =
    selectedLocationTypes.length > 0 ||
    locationStatus === 'granted';

  const handleCountryInputChange = (value: string) => {
    setCountrySearch(value);
    setIsCountryDropdownOpen(true);
    if (!value) onCountrySelect(null);
  };

  const handleCountryPick = (name: string) => {
    onCountrySelect(name);
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  const handleClearCountry = () => {
    onCountrySelect(null);
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  const handleDesktopCountryInputChange = (value: string) => {
    setCountrySearch(value);
    setIsCountryDropdownOpenDesktop(true);
    if (!value) onCountrySelect(null);
  };

  const handleDesktopCountryPick = (name: string) => {
    onCountrySelect(name);
    setCountrySearch('');
    setIsCountryDropdownOpenDesktop(false);
  };

  const handleDesktopClearCountry = () => {
    onCountrySelect(null);
    setCountrySearch('');
    setIsCountryDropdownOpenDesktop(false);
  };

  const openCountryDropdown = () => {
    setCountrySearch('');
    setIsCountryDropdownOpen(true);
    // Focus the input after render
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // ─── Mobile top bar ───────────────────────────────────────────────────────
  const mobileTopBar = (
    <div className="absolute top-4 left-4 right-4 z-[9998] md:hidden" ref={mobileDropdownRef}>
      {/* Pill bar */}
      <div className="bg-neutral-0 rounded-full shadow-lg px-2 py-2 flex items-center gap-2">
        {isCountryDropdownOpen ? (
          /* Active search input */
          <div className="flex-1 min-w-0 border border-neutral-1000 rounded-full px-4 py-2.5 flex items-center gap-3 bg-neutral-0">
            <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              className="flex-1 min-w-0 text-sm text-neutral-1000 outline-none bg-transparent placeholder-neutral-300"
              placeholder="Wybierz kraj"
              value={countrySearch}
              onChange={e => handleCountryInputChange(e.target.value)}
              autoFocus
            />
            <button
              onClick={() => {
                setIsCountryDropdownOpen(false);
                setCountrySearch('');
              }}
              aria-label="Zamknij"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        ) : hasActiveFilters && (selectedCountry || locationStatus === 'granted') ? (
          /* Show selected country/nearby as clickable area in the search bar */
          <div className="flex-1 min-w-0 border border-neutral-300 rounded-full px-4 py-2.5 flex items-center gap-3 bg-neutral-0 cursor-pointer">
            <div className="flex-1 min-w-0 flex items-center gap-3" onClick={openCountryDropdown}>
              <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
              <span className="flex-1 text-neutral-1000 text-sm truncate font-medium">
                {locationStatus === 'granted' ? `W pobliżu (${nearbyRadius} km)` : selectedCountry}
              </span>
            </div>
            <button
              onClick={() => {
                if (locationStatus === 'granted') onClearNearby();
                else handleClearCountry();
              }}
              aria-label="Wyczyść"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
          </div>
        ) : (
          /* Default "Wybierz kraj" button */
          <button
            onClick={openCountryDropdown}
            className="flex-1 min-w-0 border border-neutral-300 rounded-full px-4 py-2.5 flex items-center gap-3 text-left bg-neutral-0"
            aria-label="Wybierz kraj"
          >
            <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
            <span className="flex-1 text-neutral-300 text-sm truncate">Wybierz kraj</span>
          </button>
        )}

        {/* Filter icon — opens drawer */}
        <button
          onClick={onToggleFilters}
          className={`rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center ${
            hasActiveTypeFilters
              ? 'bg-primary text-neutral-0'
              : 'bg-neutral-200 text-neutral-900'
          }`}
          aria-label="Filtry"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Country dropdown — below the pill bar */}
      {isCountryDropdownOpen && (
        <div className="mt-2 bg-neutral-0 rounded-2xl shadow-lg border border-neutral-200 max-h-72 overflow-y-auto">
          {/* Nearby option */}
          <button
            onClick={() => {
              setIsCountryDropdownOpen(false);
              onRequestLocation();
            }}
            className="w-full text-left px-4 py-3 text-sm text-neutral-500 hover:bg-bg-primary flex items-center gap-2 border-b border-neutral-200"
          >
            {locationStatus === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
            ) : (
              <MapPin className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="flex-1">Szukaj w pobliżu mojej lokalizacji</span>
            {locationStatus === 'denied' && <span className="text-xs text-red-500">Brak dostępu</span>}
            {locationStatus === 'granted' && <Check className="h-4 w-4 text-primary" />}
          </button>

          {/* Country list */}
          {filteredCountries.length > 0 ? (
            filteredCountries.map(c => (
              <button
                key={c.name}
                onClick={() => handleCountryPick(c.name)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-bg-primary flex justify-between items-center"
              >
                <span className={selectedCountry === c.name ? 'font-bold text-neutral-1000' : 'text-neutral-1000'}>
                  {c.name}
                </span>
                {selectedCountry === c.name && <Check className="h-4 w-4 text-neutral-1000" />}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-neutral-300">Brak wyników</div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Filter drawer content (sheet on mobile) ───────────────────────────
  const filterDrawerContent = (
    <div className="w-full flex flex-col h-full bg-bg-primary">
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-1000 text-2xl">Filtry</span>
          <button
            onClick={onToggleFilters}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-200 transition-colors"
            aria-label="Zamknij filtry"
          >
            <X className="h-5 w-5 text-neutral-1000" />
          </button>
        </div>

        {/* Radius slider — shown when nearby is active */}
        {locationStatus === 'granted' && (
          <div className="space-y-3">
            <span className="font-semibold text-neutral-1000 text-base">Zasięg</span>
            <div>
              <div className="flex justify-between text-sm text-neutral-500 mb-1">
                <span>Odległość</span><span>{nearbyRadius} km</span>
              </div>
              <input
                type="range" min={10} max={100} step={5} value={nearbyRadius}
                onChange={e => onSetNearbyRadius(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-neutral-300 mt-0.5">
                <span>10 km</span><span>100 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Rodzaj lokacji */}
        <div className="space-y-3">
          <span className="font-semibold text-neutral-1000 text-base">Rodzaj lokacji</span>
          <div className="flex flex-wrap gap-2.5">
            {LOCATION_TYPES.map(({ type, label, icon: Icon }) => {
              const active = selectedLocationTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => onToggleLocationType(type)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border transition-colors ${
                    active
                      ? 'bg-neutral-200 text-neutral-1000 border-neutral-300'
                      : 'border-neutral-300 text-neutral-1000 bg-neutral-0'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div
        className="flex items-center gap-3 px-5 py-4 bg-bg-primary border-t border-neutral-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onResetFilters}
          className="flex-1 py-3 rounded-full text-sm font-semibold border border-neutral-300 text-neutral-1000 bg-neutral-0 transition-colors"
        >
          Wyczyść filtry
        </button>
        <button
          onClick={onToggleFilters}
          className="flex-1 py-3 rounded-full text-sm font-semibold bg-neutral-1000 text-neutral-0 transition-colors"
        >
          Szukaj lokacji ({filteredCount.toLocaleString('pl-PL')})
        </button>
      </div>
    </div>
  );

  // ─── Desktop full filter panel (sidebar — includes country + types) ─────
  const desktopFilterContent = (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-lg">Filtry</span>
          <button
            onClick={onToggleFilters}
            className="p-1 rounded hover:bg-secondary transition-colors"
            aria-label="Zamknij filtry"
          >
            <X className="h-5 w-5 text-primary" />
          </button>
        </div>

        {/* Lokalizacja */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Lokalizacja</span>
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center border border-secondary-border rounded-lg px-3 py-2.5 gap-2 bg-neutral-0">
              {locationStatus === 'loading'
                ? <Loader2 className="h-4 w-4 animate-spin text-neutral-300 flex-shrink-0" />
                : locationStatus === 'granted'
                  ? <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  : <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
              }
              <input
                type="text"
                readOnly={locationStatus === 'loading' || locationStatus === 'granted'}
                className="flex-1 text-sm text-primary outline-none bg-transparent placeholder-neutral-300"
                placeholder="Szukaj w danym regionie"
                value={
                  locationStatus === 'loading' ? 'Uzyskiwanie lokalizacji…' :
                  locationStatus === 'granted' ? 'Moja lokalizacja' :
                  selectedCountry && !isCountryDropdownOpenDesktop ? selectedCountry : countrySearch
                }
                onMouseDown={(e) => {
                  if (locationStatus === 'loading') { e.preventDefault(); return; }
                  if (isCountryDropdownOpenDesktop) {
                    e.preventDefault();
                    setIsCountryDropdownOpenDesktop(false);
                  }
                }}
                onFocus={() => {
                  if (locationStatus === 'loading') return;
                  if (locationStatus === 'granted') {
                    onClearNearby();
                    setIsCountryDropdownOpenDesktop(true);
                    return;
                  }
                  setCountrySearch('');
                  setIsCountryDropdownOpenDesktop(true);
                }}
                onChange={e => handleDesktopCountryInputChange(e.target.value)}
              />
              {(selectedCountry || locationStatus === 'granted') && (
                <button
                  onClick={locationStatus === 'granted' ? onClearNearby : handleDesktopClearCountry}
                  aria-label="Wyczyść"
                >
                  <X className="h-4 w-4 text-neutral-300 hover:text-primary" />
                </button>
              )}
            </div>
            {isCountryDropdownOpenDesktop && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-neutral-0 border border-secondary-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setIsCountryDropdownOpenDesktop(false);
                    onRequestLocation();
                  }}
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
                      onClick={() => handleDesktopCountryPick(c.name)}
                      className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-secondary flex justify-between items-center"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-neutral-300">({c.count})</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-neutral-300">Brak wyników</div>
                )}
              </div>
            )}
          </div>
          {/* Radius slider — shown when nearby is active */}
          {locationStatus === 'granted' && (
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-1">
                <span>Zasięg</span><span>{nearbyRadius} km</span>
              </div>
              <input
                type="range" min={10} max={100} step={5} value={nearbyRadius}
                onChange={e => onSetNearbyRadius(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-neutral-300 mt-0.5">
                <span>10 km</span><span>100 km</span>
              </div>
            </div>
          )}
        </div>

        {/* Rodzaj lokacji */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Rodzaj lokacji</span>
          <div className="flex flex-wrap gap-2">
            {LOCATION_TYPES.map(({ type, label, icon: Icon }) => {
              const active = selectedLocationTypes.includes(type);
              const count = locationTypeCounts[type] ?? 0;
              return (
                <button
                  key={type}
                  onClick={() => onToggleLocationType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    active
                      ? 'bg-primary text-secondary border-primary'
                      : 'border-secondary-border text-primary hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  <span className={active ? 'opacity-70' : 'text-neutral-300'}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom */}
      <div
        className="flex items-center justify-between gap-3 p-4 bg-neutral-0 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
        onClick={e => e.stopPropagation()}
      >
        {hasActiveFilters ? (
          <button onClick={onResetFilters} className="text-sm text-primary hover:underline flex-shrink-0">
            Wyczyść
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onToggleFilters}
          className="bg-primary text-secondary py-2.5 px-5 rounded-xl font-semibold text-sm hover:bg-primary-darker transition-colors flex-shrink-0"
        >
          Pokaż {filteredCount.toLocaleString('pl-PL')}{' '}
          {filteredCount === 1 ? 'miejsce' : filteredCount < 5 ? 'miejsca' : 'miejsc'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — absolute overlay with inline dropdown */}
      {mobileTopBar}

      {/* Filter sheet — mobile only (type filters + radius) */}
      {isMobile && (
        <Sheet
          isOpen={isOpen}
          onClose={onToggleFilters}
          detent="full-height"
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content style={{ display: 'flex', flexDirection: 'column' }}>
              {filterDrawerContent}
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={onToggleFilters} />
        </Sheet>
      )}
    </>
  );
}
