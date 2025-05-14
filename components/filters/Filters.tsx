import { Earth, Heart, Search, X } from 'lucide-react';
import { CountryData, Location } from '../../types/Location';
import LocationIcon from '../location/LocationIcon';
import { AnimatedList } from './AnimatedList';
import { SearchInput } from './SearchInput';
import { useEffect, useState } from 'react';
import { Sheet } from 'react-modal-sheet';

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
  allLocations: Location[];
  favouriteLocationIds: string[];
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
  allLocations,
  favouriteLocationIds,
}: FiltersProps) {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favoriteLocations, setFavoriteLocations] = useState<Location[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    const favorites = allLocations.filter(location => 
      favouriteLocationIds.includes(location.id)
    );
    setFavoriteLocations(favorites);
  }, [isFavoritesOpen, allLocations, favouriteLocationIds]);

  const handleFavoritesClick = () => {
    const newState = !isFavoritesOpen;
    setIsFavoritesOpen(newState);
  };

  // Filter content that will be used in both desktop and mobile views
  const filterContent = (
    <div className="w-full h-full overflow-y-auto">
      <div className="p-4">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Szukaj lokacji, filmów..."
        />
        {selectedCountry || selectedVideo ? (
          <button
            onClick={onResetFilters}
            className="w-full text-center px-3 py-2 rounded-lg mb-4 text-red-500 hover:text-red-600"
          >
            Resetuj filtry
          </button>
        ) : (
          <div className="w-full text-center px-3 py-2 rounded-lg mb-4 text-gray-500">
            Wybierz kraj lub odcinek
          </div>
        )}

        <div className="border border-secondary-border rounded-lg overflow-hidden">
          <div className="w-full flex items-center gap-1 p-3 bg-secondary">
            <Earth className="h-4 w-4 text-primary"/>
            <span className="font-bold text-primary">Wszystkie lokacje ({totalLocations})</span>
          </div>
          
          <div className="p-2 space-y-1">
            <button
              onClick={handleFavoritesClick}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                isFavoritesOpen 
                  ? 'bg-secondary-darker text-primary' 
                  : 'hover:bg-secondary text-primary-hover'
              }`}
            >
              <span className="flex items-center gap-2 truncate pr-2 text-sm">
                <Heart className={`h-4 w-4 ${isFavoritesOpen ? 'fill-red-500 text-red-500' : ''}`} />
                Ulubione ({favoriteLocations.length})
              </span>
              <span className="ml-2">
                {isFavoritesOpen ? '▼' : '▶'}
              </span>
            </button>
            <AnimatedList 
              isOpen={isFavoritesOpen}
              className="ml-4 space-y-2"
              defaultOpen={false}          
            >
              {favoriteLocations.length > 0 ? (
                favoriteLocations.map((location) => (
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
                      <LocationIcon type={location.type} />
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Brak ulubionych lokacji
                </div>
              )}
            </AnimatedList>
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
                  defaultOpen={false}
                >
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
                              <LocationIcon type={location.type} />
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
  );

  return (
    <>
      {/* Desktop View */}
      {!isMobile && (
        <>
          {/* Filters Panel for Desktop */}
          <aside 
            className={`fixed md:top-[116px] bottom-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
              h-[calc(100vh-116px)] max-h-screen
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ zIndex: 9999 }}
          >
            <div className="relative h-full">
              {filterContent}
            </div>
          </aside>
        </>
      )}

      {/* Mobile View with react-modal-sheet */}
      {isMobile && (
        <Sheet
          isOpen={isOpen}
          onClose={onToggleFilters}
          detent="content-height"
        >
          <Sheet.Container>
            <Sheet.Header />
            <Sheet.Content>
              {filterContent}
            </Sheet.Content>
          </Sheet.Container>
          <Sheet.Backdrop onTap={onToggleFilters} />
        </Sheet>
      )}

      {/* Toggle Button - for both mobile and desktop */}
      <button
        onClick={onToggleFilters}
        className="fixed bottom-4 left-4 w-12 h-12 bg-primary text-secondary rounded-full shadow-lg flex items-center justify-center z-[9999] hover:bg-primary-darker transition-colors"
        aria-label={isOpen ? 'Ukryj filtry' : 'Pokaż filtry'}
      >
        {isOpen ? 
          <X className="absolute right-3 top-1/2 transform -translate-y-1/2"/>
          : 
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2"/>
        }
        {(selectedCountry || selectedVideo) && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>
    </>
  );
}