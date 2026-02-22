import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLocations } from '../hooks/useLocations';
import Head from 'next/head';
import { useLocationState } from '../hooks/useLocationState';
import { Filters } from '../components/filters/Filters';
import { LocationDetails } from '../components/location/LocationDetails';
import type { Location as MapLocation } from '../types/Location';

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
    previewLocation,
    setPreviewLocation,
    selectedCountry,
    setSelectedCountry,
    selectedLocationTypes,
    setSelectedLocationTypes,
    selectedCharacters,
    setSelectedCharacters,
    isFiltersOpen,
    setIsFiltersOpen,
    toggleLocationType,
    toggleCharacter,
  } = useLocationState();

  const { countries, filteredLocations, locationTypeCounts, characterCounts, allLocations } =
    useLocations(selectedCountry, selectedLocationTypes, selectedCharacters);

  // Stable callbacks so Map's marker memo doesn't invalidate unnecessarily
  const handleLocationSelect = React.useCallback((loc: MapLocation) => {
    setSelectedLocation(loc);
    setPreviewLocation(null);
  }, [setSelectedLocation, setPreviewLocation]);

  const handleLocationPreview = React.useCallback((loc: MapLocation) => {
    setPreviewLocation(loc);
  }, [setPreviewLocation]);

  const handleClosePreview = React.useCallback(() => {
    setPreviewLocation(null);
  }, [setPreviewLocation]);

  React.useEffect(() => {
    if (!router.isReady) return;
    const countryParam = router.query.country;
    if (typeof countryParam === 'string' && countryParam.trim()) {
      setSelectedCountry(decodeURIComponent(countryParam));
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.placeId, allLocations]);

  return (
    <main className="flex-1 flex flex-col bg-secondary">
      {selectedLocation && (
        <Head>
          <title>{`${selectedLocation.name} | Śladami Roberta Makłowicza`}</title>
        </Head>
      )}
      <div className="flex flex-1 relative">
        <Filters
          isOpen={isFiltersOpen}
          countries={countries}
          selectedCountry={selectedCountry}
          selectedLocationTypes={selectedLocationTypes}
          selectedCharacters={selectedCharacters}
          filteredCount={filteredLocations.length}
          locationTypeCounts={locationTypeCounts}
          characterCounts={characterCounts}
          onCountrySelect={(country) => setSelectedCountry(country)}
          onToggleLocationType={toggleLocationType}
          onToggleCharacter={toggleCharacter}
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
          onResetFilters={() => {
            setSelectedCountry(null);
            setSelectedLocationTypes([]);
            setSelectedCharacters([]);
          }}
        />

        <div className="flex-1">
          <Map
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            previewLocation={previewLocation}
            onLocationSelect={handleLocationSelect}
            onLocationPreview={handleLocationPreview}
            onClosePreview={handleClosePreview}
          />
        </div>

        <LocationDetails
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>
    </main>
  );
}
