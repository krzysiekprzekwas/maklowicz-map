import { Location, LocationType } from '../../types/Location';
import { SearchInput } from './SearchInput';

interface CountryData {
  name: string;
  locations: Location[];
  videos: {
    videoId: string;
    title: string;
    date: string;
    show: string;
    locations: Location[];
  }[];
}

interface FiltersProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  countries: CountryData[];
  selectedCountry: string | null;
  selectedVideo: string | null;
  selectedLocation: Location | null;
  expandedCountries: Set<string>;
  expandedVideos: Set<string>;
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
  expandedCountries,
  expandedVideos,
  totalLocations,
  onCountryClick,
  onVideoClick,
  onLocationClick,
  onToggleFilters,
  onResetFilters,
}: FiltersProps) {
  return (
    <aside 
      className={`fixed top-[116px] bottom-0 left-0 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-80'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="relative h-full">
        {/* Filters Content */}
        <div className="w-80 h-full bg-white shadow-xl overflow-y-auto">
          <div className="p-4">
            <SearchInput value={searchQuery} onChange={onSearchChange} />

            {/* All Locations Button */}
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

            {/* Countries Section */}
            <div className="border border-secondary-border rounded-lg overflow-hidden">
              <div className="w-full flex items-center justify-between p-3 bg-secondary">
                <span className="font-bold text-primary">🗺️ Kraje</span>
              </div>
              
              <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {countries.map((country) => (
                  <div key={country.name} className="space-y-1">
                    {/* Country Button */}
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
                        {expandedCountries.has(country.name) ? '▼' : '▶'}
                      </span>
                    </button>

                    {/* Videos Level */}
                    {expandedCountries.has(country.name) && (
                      <div className="ml-4 space-y-1">
                        {country.videos.map((video) => (
                          <div key={video.videoId} className="space-y-1">
                            {/* Video Button */}
                            <button
                              onClick={(e) => onVideoClick(video.videoId, e)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                                selectedVideo === video.videoId
                                  ? 'bg-secondary-darker text-primary' 
                                  : 'hover:bg-secondary text-primary-hover'
                              }`}
                            >
                              <span className="flex-1 truncate pr-2 text-sm">
                                {video.title}
                              </span>
                              <span className="text-xs opacity-70">
                                ({video.locations.length})
                              </span>
                              <span className="ml-2">
                                {expandedVideos.has(video.videoId) ? '▼' : '▶'}
                              </span>
                            </button>

                            {/* Locations Level */}
                            {expandedVideos.has(video.videoId) && (
                              <div className="ml-4 space-y-1">
                                {video.locations.map((location) => (
                                  <button
                                    key={location.id}
                                    onClick={() => onLocationClick(location)}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                                      selectedLocation?.id === location.id
                                        ? 'bg-secondary-darker text-primary' 
                                        : 'hover:bg-secondary text-primary-hover'
                                    }`}
                                  >
                                    <span className="flex-1 truncate pr-2 text-sm">
                                      {location.name}
                                    </span>
                                    <span className="text-xs opacity-70">
                                      {location.type === 'restaurant' ? '🍴' : 
                                       location.type === 'attraction' ? '🏛️' : '📍'}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Ribbon */}
        <button
          onClick={onToggleFilters}
          className="absolute top-4 -right-8 bg-white shadow-lg rounded-r-lg px-2 py-4 text-primary hover:text-primary-hover transition-colors"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </aside>
  );
} 