import { CountryData, Location } from '../../types/Location';
import LocationIcon from '../location/LocationIcon';
import { AnimatedList } from './AnimatedList';
import { SearchInput } from './SearchInput';

interface FiltersProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  countries: CountryData[];
  selectedCountry: string | null;
  selectedVideo: string | null;
  selectedLocation: Location | null;
  totalLocations: number;
  onCountryClick: (countryName: string) => void;
  onVideoClick: (videoId: string, event: React.MouseEvent) => void;
  onLocationClick: (location: Location) => void;
  onToggleFilters: () => void;
  onResetFilters: () => void;
}

export function Filters({
  isOpen,
  searchQuery,
  onSearchChange,
  countries,
  selectedCountry,
  selectedVideo,
  selectedLocation,
  totalLocations,
  onCountryClick,
  onVideoClick,
  onLocationClick,
  onToggleFilters,
  onResetFilters,
}: FiltersProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onToggleFilters}
      />

      {/* Filters Panel */}
      <aside 
        className={`fixed md:top-[116px] bottom-0 left-0 w-full md:w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
          h-[75vh] max-h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}
        style={{ zIndex: 9999 }}
      >
        <div className="relative h-full">
          <div className="w-full h-full overflow-y-auto">
            <div className="p-4">
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Szukaj lokacji, filmów..."
              />

              <button
                onClick={onResetFilters}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-4 ${
                  !selectedCountry && !selectedVideo
                    ? 'bg-secondary-darker text-primary' 
                    : 'hover:bg-secondary text-primary-hover'
                }`}
              >
                🌍 Wszystkie lokacje ({totalLocations})
              </button>

              <div className="border border-secondary-border rounded-lg overflow-hidden">
                <div className="w-full flex items-center justify-between p-3 bg-secondary">
                  <span className="font-bold text-primary">🗺️ Kraje</span>
                </div>
                
                <div className="p-2 space-y-1">
                  {countries.map((country) => (
                    <div key={country.name} className="space-y-1">
                      <button
                        onClick={() => onCountryClick(country.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                          selectedCountry === country.name
                            ? 'bg-secondary-darker text-primary' 
                            : 'hover:bg-secondary text-primary-hover'
                        }`}
                      >
                        <span className="flex-1 truncate pr-2">
                          {country.name}
                        </span>
                        <span className="text-xs opacity-70">
                          ({country.locations.length})
                        </span>
                        <span className="ml-2">
                          {selectedCountry == country.name ? '▼' : '▶'}
                        </span>
                      </button>
                      <AnimatedList 
                        isOpen={selectedCountry === country.name}
                        className="ml-4 space-y-2" 
                        defaultOpen={false}                              >
                        {country.videos.map((video) => (
                              <div key={video.videoId} className="space-y-1">
                                <button
                                  onClick={(e) => onVideoClick(video.videoId, e)}
                                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                                    selectedVideo === video.videoId
                                      ? 'bg-secondary-darker text-primary' 
                                      : 'hover:bg-secondary text-primary-hover'
                                  }`}
                                >
                                  <span className="flex-1 truncate pr-2 text-sm">
                                    { video.filterTitle || video.title }
                                  </span>
                                  <span className="text-xs opacity-70">
                                    ({video.locations.length})
                                  </span>
                                  <span className="ml-2">
                                    {selectedVideo === video.videoId ? '▼' : '▶'}
                                  </span>
                                </button>

                                <AnimatedList 
                                  isOpen={selectedVideo === video.videoId}
                                  className="ml-4 space-y-2"
                                  defaultOpen={false}          
                                >
                                  {video.locations.map((location) => (
                                    <button
                                      key={location.id}
                                      onClick={() => onLocationClick(location)}
                                      className={`
                                        w-full 
                                        text-left 
                                        px-3 
                                        py-1.5 
                                        rounded-lg 
                                        transition-colors 
                                        flex 
                                        items-center 
                                        ${selectedLocation?.id === location.id
                                          ? 'bg-secondary-darker text-primary'
                                          : 'hover:bg-secondary text-primary-hover'
                                        }
                                      `}
                                    >
                                      <span className="flex-1 truncate pr-2 text-sm">
                                        {location.name}
                                      </span>
                                      <span className="text-xs opacity-70">
                                        <LocationIcon location={location} />
                                      </span>
                                    </button>
                                  ))}
                                </AnimatedList>
                              </div>
                            ))}
                      </AnimatedList>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Toggle Button */}
      <button
        onClick={onToggleFilters}
        className="fixed bottom-4 left-4 w-12 h-12 bg-primary text-secondary rounded-full shadow-lg flex items-center justify-center z-[9999] hover:bg-primary-darker transition-colors"
        aria-label={isOpen ? 'Ukryj filtry' : 'Pokaż filtry'}
      >
        {isOpen ? '×' : '🔍'}
      </button>
    </>
  );
}