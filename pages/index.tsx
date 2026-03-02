import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocations } from '../hooks/useLocations';
import Head from 'next/head';
import { useLocationState } from '../hooks/useLocationState';
import { Filters } from '../components/filters/Filters';
import { LocationDetails } from '../components/location/LocationDetails';
import { LocationList } from '../components/location/LocationList';
import { ViewToggle } from '../components/ViewToggle';
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
    isFiltersOpen,
    setIsFiltersOpen,
    toggleLocationType,
    userLocation,
    locationStatus,
    nearbyRadius,
    setNearbyRadius,
    requestUserLocation,
    clearUserLocation,
    activeView,
    setActiveView,
  } = useLocationState();

  const { countries, filteredLocations, locationTypeCounts, allLocations } =
    useLocations(
      selectedCountry,
      selectedLocationTypes,
      userLocation?.lat,
      userLocation?.lng,
      locationStatus === 'granted' ? nearbyRadius : undefined
    );

  // Detect mobile for list view animation variant
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  const hasActiveFilters =
    !!selectedCountry ||
    selectedLocationTypes.length > 0 ||
    locationStatus === 'granted';

  const listProps = {
    locations: filteredLocations,
    onLocationSelect: handleLocationSelect,
    selectedCountry,
    selectedLocationTypes,
    filteredCount: filteredLocations.length,
    hasActiveFilters,
    locationStatus,
    nearbyRadius,
    onToggleFilters: () => setIsFiltersOpen(true),
    onRemoveCountry: () => setSelectedCountry(null),
    onRemoveLocationType: toggleLocationType,
    onClearFilters: () => {
      setSelectedCountry(null);
      setSelectedLocationTypes([]);
      clearUserLocation();
    },
    onClearNearby: clearUserLocation,
  };

  return (
    <main className="flex-1 flex flex-col bg-secondary overflow-hidden">
      {selectedLocation && (
        <Head>
          <title>{`${selectedLocation.name} | Śladami Roberta Makłowicza`}</title>
        </Head>
      )}
      <div className="flex flex-1 relative overflow-hidden">
        <Filters
          isOpen={isFiltersOpen}
          activeView={activeView}
          countries={countries}
          selectedCountry={selectedCountry}
          selectedLocationTypes={selectedLocationTypes}
          filteredCount={filteredLocations.length}
          locationTypeCounts={locationTypeCounts}
          locationStatus={locationStatus}
          nearbyRadius={nearbyRadius}
          onCountrySelect={(country) => {
            setSelectedCountry(country);
            if (country) clearUserLocation();
          }}
          onToggleLocationType={toggleLocationType}
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
          onResetFilters={() => {
            setSelectedCountry(null);
            setSelectedLocationTypes([]);
            clearUserLocation();
          }}
          onRequestLocation={requestUserLocation}
          onSetNearbyRadius={setNearbyRadius}
          onClearNearby={clearUserLocation}
        />

        {/* Desktop list panel — permanent, always visible */}
        {!isMobile && (
          <div className="w-96 flex-shrink-0 h-full overflow-hidden bg-white border-r border-secondary-border shadow-xl">
            <LocationList {...listProps} />
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          <Map
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            previewLocation={previewLocation}
            onLocationSelect={handleLocationSelect}
            onLocationPreview={handleLocationPreview}
            onClosePreview={handleClosePreview}
            userLat={userLocation?.lat}
            userLng={userLocation?.lng}
            leftPanelWidth={isMobile ? 0 : 384}
          />

          {/* Mobile list overlay — slides up from bottom */}
          {isMobile && (
            <AnimatePresence>
              {activeView === 'list' && (
                <motion.div
                  key="list-mobile"
                  className="absolute inset-0 z-[9980] bg-white"
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                >
                  <LocationList {...listProps} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <LocationDetails
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>

      {isMobile && <ViewToggle activeView={activeView} onViewChange={setActiveView} />}
    </main>
  );
}
