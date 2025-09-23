import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLocations } from '../hooks/useLocations';
import { useLocationState } from '../hooks/useLocationState';
import { Filters } from '../components/filters/Filters';
import { LocationDetails } from '../components/location/LocationDetails';

const Map = dynamic(() => import('../components/map/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-secondary">
      <div className="text-primary text-xl">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  const router = useRouter();
  const {
    selectedLocation,
    setSelectedLocation,
    selectedCountry,
    setSelectedCountry,
    selectedVideo,
    setSelectedVideo,
    isFiltersOpen,
    setIsFiltersOpen,
    searchQuery,
    setSearchQuery,
    favouriteLocationIds,
    addFavouriteLocation,
    removeFavouriteLocation,
    handleCountryClick,
    handleVideoClick
  } = useLocationState();

  const { countries, filteredLocations, totalLocations, allLocations } = useLocations(searchQuery, selectedCountry, selectedVideo);

  React.useEffect(() => {
    if (!router.isReady) return;
    const countryParam = router.query.country;
    if (typeof countryParam === 'string' && countryParam.trim()) {
      setSelectedCountry(decodeURIComponent(countryParam));
      setSelectedVideo(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.country]);

  React.useEffect(() => {
    if (!router.isReady) return;
    const placeIdParam = router.query.placeId;
    if (typeof placeIdParam !== 'string' || !placeIdParam.trim()) return;
    const target = allLocations.find((l) => l.id === placeIdParam);
    if (!target) return;
    setSelectedLocation(target);
    if (selectedCountry !== target.country) {
      setSelectedCountry(target.country);
      setSelectedVideo(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.placeId, allLocations]);

  return (
    <main className="flex-1 flex flex-col bg-secondary">
      <div className="flex flex-1 relative">
        <Filters
          isOpen={isFiltersOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          countries={countries}
          selectedCountry={selectedCountry}
          selectedVideo={selectedVideo}
          selectedLocation={selectedLocation}
          totalLocations={totalLocations}
          onCountryClick={handleCountryClick}
          onVideoClick={handleVideoClick}
          onLocationClick={setSelectedLocation}
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
          onResetFilters={() => 
            {
              setSelectedCountry(null);
              setSelectedVideo(null);
            }}
          allLocations={allLocations}
          favouriteLocationIds={favouriteLocationIds}
        />

        <div className="flex-1">
          <Map locations={filteredLocations} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} />
        </div>

        <LocationDetails 
          location={selectedLocation} 
          onClose={() => setSelectedLocation(null)}
          favouriteLocationIds={favouriteLocationIds}
          removeFavouriteLocation={removeFavouriteLocation}
          addFavouriteLocation={addFavouriteLocation}
        />
      </div>
    </main>
  );
}
