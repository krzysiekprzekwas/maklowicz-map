import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { X, Search, Check, MapPin, Loader2 } from 'lucide-react';

interface LandingSearchProps {
  countries: { name: string; count: number }[];
}

export function LandingSearch({ countries }: LandingSearchProps) {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const countryInputRef = useRef<HTMLInputElement>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Close country dropdown when clicking outside
  useEffect(() => {
    if (!isCountryDropdownOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsCountryDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isCountryDropdownOpen]);

  const buildMapUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    const qs = params.toString();
    return `/map${qs ? `?${qs}` : ''}`;
  }, [selectedCountry]);

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

  const handleRequestLocation = useCallback(() => {
    setLocationStatus('loading');
    setIsCountryDropdownOpen(false);
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationStatus('granted');
        router.push('/map?nearby=1');
      },
      () => {
        setLocationStatus('denied');
      }
    );
  }, [router]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pill bar */}
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

        <button
          onClick={() => router.push(buildMapUrl())}
          className="rounded-full flex-shrink-0 flex items-center justify-center bg-neutral-1000 text-neutral-0 md:px-6 md:py-2.5 md:text-sm md:font-semibold w-10 h-10 md:w-auto md:h-auto"
          aria-label="Szukaj na mapie"
        >
          <Search className="h-5 w-5 md:hidden" />
          <span className="hidden md:inline">Szukaj na mapie</span>
        </button>
      </div>

      {/* Country dropdown */}
      {isCountryDropdownOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-neutral-0 rounded-2xl shadow-lg border border-neutral-200 max-h-72 overflow-y-auto z-50">
          {/* Nearby option */}
          <button
            onClick={handleRequestLocation}
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
  );
}
