import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Sheet } from 'react-modal-sheet';
import { X, Search, Check } from 'lucide-react';
import { LOCATION_TYPES } from '../../src/lib/locationTypeMeta';

interface LandingSearchProps {
  countries: { name: string; count: number }[];
  filteredCount: number;
}

export function LandingSearch({ countries, filteredCount }: LandingSearchProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const [navigating, setNavigating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Close country dropdown when clicking outside
  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node))
        setIsCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCountryDropdownOpen]);

  const toggleLocationType = useCallback((type: string) => {
    setSelectedLocationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  const buildMapUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    const qs = params.toString();
    return `/map${qs ? `?${qs}` : ''}`;
  }, [selectedCountry]);

  // Close sheet after route change completes (smooth reveal)
  useEffect(() => {
    if (!navigating) return;
    const handleComplete = () => {
      setNavigating(false);
      setIsOpen(false);
    };
    router.events.on('routeChangeComplete', handleComplete);
    return () => router.events.off('routeChangeComplete', handleComplete);
  }, [navigating, router.events]);

  const handleSearch = () => {
    setNavigating(true);
    router.push(buildMapUrl());
  };

  const handleReset = () => {
    setSelectedCountry(null);
    setSelectedLocationTypes([]);
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  const handleCountryPick = (name: string) => {
    setSelectedCountry((prev) => (prev === name ? null : name));
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  const openCountryDropdown = () => {
    setCountrySearch('');
    setIsCountryDropdownOpen(true);
    setTimeout(() => countryInputRef.current?.focus(), 50);
  };

  const handleClearCountry = () => {
    setSelectedCountry(null);
    setCountrySearch('');
    setIsCountryDropdownOpen(false);
  };

  // ─── Pill bar ──────────────────────────────────────────────────────────
  const pillBar = (
    <div className="bg-neutral-0 rounded-full shadow-200 px-2 py-2 flex items-center gap-2">
      <button
        onClick={() => setIsOpen(true)}
        className="flex-1 min-w-0 border border-neutral-300 rounded-full px-4 py-2.5 flex items-center gap-3 text-left bg-neutral-0"
      >
        <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
        <span className="flex-1 text-neutral-300 text-sm truncate">
          {selectedCountry || 'Wybierz kraj'}
        </span>
      </button>

      <button
        onClick={() => router.push(buildMapUrl())}
        className="rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center bg-accent text-neutral-1000"
        aria-label="Szukaj na mapie"
      >
        <Search className="h-5 w-5" />
      </button>
    </div>
  );

  // ─── Drawer content ────────────────────────────────────────────────────
  const drawerContent = (
    <div className="w-full flex flex-col h-full bg-bg-primary">
      <div className="flex-1 overflow-y-auto px-5 pt-2 pb-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-neutral-1000 text-2xl">Szukaj</span>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-200 transition-colors"
            aria-label="Zamknij"
          >
            <X className="h-5 w-5 text-neutral-1000" />
          </button>
        </div>

        {/* Country dropdown */}
        <div className="space-y-3">
          <span className="font-semibold text-neutral-1000 text-base">Kraj</span>
          <div ref={countryDropdownRef} className="relative">
            {/* Pill-style selector */}
            <div className="bg-neutral-0 rounded-full shadow-200 px-2 py-2 flex items-center gap-2">
              {isCountryDropdownOpen ? (
                <div className="flex-1 min-w-0 border border-neutral-1000 rounded-full px-4 py-2.5 flex items-center gap-3 bg-neutral-0">
                  <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
                  <input
                    ref={countryInputRef}
                    type="text"
                    className="flex-1 min-w-0 text-sm text-neutral-1000 outline-none bg-transparent placeholder-neutral-300"
                    placeholder="Wybierz kraj"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    autoFocus
                  />
                  <button
                    onClick={() => { setIsCountryDropdownOpen(false); setCountrySearch(''); }}
                    aria-label="Zamknij"
                  >
                    <X className="h-4 w-4 text-neutral-500" />
                  </button>
                </div>
              ) : selectedCountry ? (
                <div className="flex-1 min-w-0 border border-neutral-300 rounded-full px-4 py-2.5 flex items-center gap-3 bg-neutral-0 cursor-pointer">
                  <div className="flex-1 min-w-0 flex items-center gap-3" onClick={openCountryDropdown}>
                    <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
                    <span className="flex-1 text-neutral-1000 text-sm truncate font-medium">
                      {selectedCountry}
                    </span>
                  </div>
                  <button onClick={handleClearCountry} aria-label="Wyczyść">
                    <X className="h-4 w-4 text-neutral-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openCountryDropdown}
                  className="flex-1 min-w-0 border border-neutral-300 rounded-full px-4 py-2.5 flex items-center gap-3 text-left bg-neutral-0"
                  aria-label="Wybierz kraj"
                >
                  <Search className="h-4 w-4 text-neutral-300 flex-shrink-0" />
                  <span className="flex-1 text-neutral-300 text-sm truncate">Wybierz kraj</span>
                </button>
              )}
            </div>

            {/* Floating dropdown */}
            {isCountryDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-neutral-0 rounded-2xl shadow-lg border border-neutral-200 max-h-72 overflow-y-auto z-50">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
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
        </div>

        {/* Location types */}
        <div className="space-y-3">
          <span className="font-semibold text-neutral-1000 text-base">Rodzaj lokacji</span>
          <div className="flex flex-wrap gap-2.5">
            {LOCATION_TYPES.map(({ type, label, icon: Icon }) => {
              const active = selectedLocationTypes.includes(type);
              return (
                <button
                  key={type}
                  onClick={() => toggleLocationType(type)}
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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleReset}
          className="flex-1 py-3 rounded-full text-sm font-semibold border border-neutral-300 text-neutral-1000 bg-neutral-0 transition-colors"
        >
          Wyczyść filtry
        </button>
        <button
          onClick={handleSearch}
          disabled={navigating}
          className="flex-1 py-3 rounded-full text-sm font-semibold bg-neutral-1000 text-neutral-0 transition-colors disabled:opacity-70"
        >
          {navigating ? 'Ładowanie...' : `Szukaj lokacji (${filteredCount.toLocaleString('pl-PL')})`}
        </button>
      </div>
    </div>
  );

  // ─── Desktop modal ─────────────────────────────────────────────────────
  const desktopModal = isOpen && (
    <div className="fixed inset-0 z-[10001] hidden md:flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-1000/40" onClick={() => setIsOpen(false)} />
      <div className="relative bg-bg-primary rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {drawerContent}
      </div>
    </div>
  );

  return (
    <>
      {pillBar}
      {!isMobile && desktopModal}

      {/* Mobile sheet */}
      {isMobile && (
        <Sheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          detent="full-height"
          style={{ zIndex: 10001 }}
        >
          <Sheet.Container style={{ borderRadius: 0 }}>
            <Sheet.Content style={{ display: 'flex', flexDirection: 'column' }}>
              {drawerContent}
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={() => setIsOpen(false)} />
        </Sheet>
      )}
    </>
  );
}
