import { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';
import {
  X, SlidersHorizontal, Search,
  Utensils, Coffee, TreePine, Palette,
  Landmark, ShoppingBag, Hotel, Compass, MoreHorizontal,
} from 'lucide-react';

interface FiltersProps {
  isOpen: boolean;
  countries: { name: string; count: number }[];
  selectedCountry: string | null;
  selectedLocationTypes: string[];
  selectedCharacters: string[];
  filteredCount: number;
  locationTypeCounts: Record<string, number>;
  characterCounts: Record<string, number>;
  onCountrySelect: (country: string | null) => void;
  onToggleLocationType: (type: string) => void;
  onToggleCharacter: (char: string) => void;
  onToggleFilters: () => void;
  onResetFilters: () => void;
}

const LOCATION_TYPES = [
  { type: 'restaurant',         label: 'Restauracje',          icon: Utensils       },
  { type: 'cafe',               label: 'Kawiarnie',            icon: Coffee         },
  { type: 'nature',             label: 'Przyroda i plener',    icon: TreePine       },
  { type: 'art_culture',        label: 'Sztuka i kultura',     icon: Palette        },
  { type: 'museum',             label: 'Muzea',                icon: Landmark       },
  { type: 'shopping',           label: 'Zakupy',               icon: ShoppingBag    },
  { type: 'hotel',              label: 'Hotele',               icon: Hotel          },
  { type: 'tourist_attraction', label: 'Atrakcje turystyczne', icon: Compass        },
  { type: 'other',              label: 'Inne',                 icon: MoreHorizontal },
];

const CHARACTERS = ['historyczny', 'patriotyczny', 'religijny', 'relaks'];

export function Filters({
  isOpen,
  countries,
  selectedCountry,
  selectedLocationTypes,
  selectedCharacters,
  filteredCount,
  locationTypeCounts,
  characterCounts,
  onCountrySelect,
  onToggleLocationType,
  onToggleCharacter,
  onToggleFilters,
  onResetFilters,
}: FiltersProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const hasActiveFilters =
    !!selectedCountry ||
    selectedLocationTypes.length > 0 ||
    selectedCharacters.length > 0;

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

  // ─── Mobile top bar ───────────────────────────────────────────────────────
  const mobileTopBar = (
    <div className="absolute top-4 left-4 right-4 z-[9998] flex items-center gap-2 md:hidden">
      {hasActiveFilters ? (
        <>
          {/* Scrollable chips */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg px-3 py-2.5 min-w-0 overflow-hidden">
            <div
              className="flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
            >
              {selectedCountry && (
                <button
                  onClick={() => onCountrySelect(null)}
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
                    onClick={() => onToggleLocationType(type)}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs whitespace-nowrap flex-shrink-0"
                  >
                    {label}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
              {selectedCharacters.map(char => (
                <button
                  key={char}
                  onClick={() => onToggleCharacter(char)}
                  className="flex items-center gap-1 px-3 py-1 bg-primary text-secondary rounded-full text-xs whitespace-nowrap flex-shrink-0"
                >
                  {char}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
          {/* Filter icon — active (dark fill) */}
          <button
            onClick={onToggleFilters}
            className="bg-primary text-secondary rounded-2xl shadow-lg w-12 h-12 flex-shrink-0 flex items-center justify-center"
            aria-label="Zmień filtry"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </>
      ) : (
        <>
          {/* CTA search bar */}
          <button
            onClick={onToggleFilters}
            className="flex-1 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3 text-left"
            aria-label="Otwórz filtry"
          >
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-gray-400 text-sm truncate">Szukaj restauracji, muzeów…</span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {filteredCount.toLocaleString('pl-PL')} miejsc
            </span>
          </button>
          {/* Filter icon — inactive (white bg) */}
          <button
            onClick={onToggleFilters}
            className="bg-white rounded-2xl shadow-lg w-12 h-12 flex-shrink-0 flex items-center justify-center"
            aria-label="Filtry"
          >
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </button>
        </>
      )}
    </div>
  );

  // ─── Full filter panel content (sheet + sidebar) ──────────────────────────
  const filterContent = (
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

        {/* Wybrane chips */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Wybrane</span>
            <div className="flex flex-wrap gap-2">
              {selectedCountry && (
                <button
                  onClick={() => onCountrySelect(null)}
                  className="flex items-center gap-1 px-2 py-1 bg-primary text-secondary rounded-full text-xs"
                >
                  {selectedCountry}
                  <X className="h-3 w-3" />
                </button>
              )}
              {selectedLocationTypes.map(type => {
                const meta = LOCATION_TYPES.find(t => t.type === type);
                return (
                  <button
                    key={type}
                    onClick={() => onToggleLocationType(type)}
                    className="flex items-center gap-1 px-2 py-1 bg-primary text-secondary rounded-full text-xs"
                  >
                    {meta?.label ?? type}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
              {selectedCharacters.map(char => (
                <button
                  key={char}
                  onClick={() => onToggleCharacter(char)}
                  className="flex items-center gap-1 px-2 py-1 bg-primary text-secondary rounded-full text-xs"
                >
                  {char}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lokalizacja */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Lokalizacja</span>
          <div className="relative">
            <div className="flex items-center border border-secondary-border rounded-lg px-3 py-2 gap-2 bg-white">
              <input
                type="text"
                className="flex-1 text-sm text-primary outline-none bg-transparent placeholder-gray-400"
                placeholder="Szukaj kraju..."
                value={selectedCountry && !isCountryDropdownOpen ? selectedCountry : countrySearch}
                onFocus={() => {
                  setCountrySearch('');
                  setIsCountryDropdownOpen(true);
                }}
                onChange={e => handleCountryInputChange(e.target.value)}
              />
              {selectedCountry && (
                <button onClick={handleClearCountry} aria-label="Wyczyść kraj">
                  <X className="h-4 w-4 text-gray-400 hover:text-primary" />
                </button>
              )}
            </div>
            {isCountryDropdownOpen && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-secondary-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(c => (
                    <button
                      key={c.name}
                      onClick={() => handleCountryPick(c.name)}
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
                  <span className={active ? 'opacity-70' : 'text-gray-400'}>({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Charakter lokacji */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Charakter lokacji</span>
          <div className="space-y-2">
            {CHARACTERS.map(char => {
              const count = characterCounts[char] ?? 0;
              const checked = selectedCharacters.includes(char);
              return (
                <label key={char} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCharacter(char)}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="flex-1 text-sm text-primary capitalize group-hover:text-primary-hover">
                    {char}
                  </span>
                  <span className="text-xs text-gray-400">({count})</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed bottom */}
      <div
        className="p-4 border-t border-secondary-border space-y-2 bg-white"
        onClick={e => e.stopPropagation()}
      >
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="w-full text-center text-sm text-primary hover:underline py-1"
          >
            Wyczyść
          </button>
        )}
        <button
          onClick={onToggleFilters}
          className="w-full bg-primary text-secondary py-3 rounded-xl font-semibold text-sm hover:bg-primary-darker transition-colors"
        >
          Pokaż {filteredCount.toLocaleString('pl-PL')}{' '}
          {filteredCount === 1 ? 'miejsce' : filteredCount < 5 ? 'miejsca' : 'miejsc'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar — absolute over map, hidden on desktop */}
      {mobileTopBar}

      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className={`fixed md:top-[116px] bottom-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
            h-[calc(100vh-116px)] max-h-screen
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ zIndex: 9999 }}
        >
          {filterContent}
        </aside>
      )}

      {/* Mobile bottom sheet */}
      {isMobile && (
        <Sheet
          isOpen={isOpen}
          onClose={onToggleFilters}
          detent="content-height"
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content>
              <div className="max-h-[80vh] flex flex-col">
                {filterContent}
              </div>
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={onToggleFilters} />
        </Sheet>
      )}

      {/* FAB — desktop only */}
      {!isMobile && (
        <button
          onClick={onToggleFilters}
          className="fixed bottom-4 left-4 w-12 h-12 bg-primary text-secondary rounded-full shadow-lg flex items-center justify-center z-[9999] hover:bg-primary-darker transition-colors"
          aria-label={isOpen ? 'Ukryj filtry' : 'Pokaż filtry'}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {hasActiveFilters && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </button>
      )}
    </>
  );
}
