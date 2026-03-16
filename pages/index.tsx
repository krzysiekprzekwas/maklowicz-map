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
import { trackLocationSelect, trackCountryFilter, trackTypeFilter, trackNearbySearch, trackViewToggle, trackShowOnMap, trackLocationPreview } from '../src/lib/analytics';

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

  const { countries, filteredLocations, locationTypeCounts, allLocations, zoomLocations } =
    useLocations(
      selectedCountry,
      selectedLocationTypes,
      userLocation?.lat,
      userLocation?.lng,
      locationStatus === 'granted' ? nearbyRadius : undefined
    );

  // Track nearby search when geolocation is granted
  useEffect(() => {
    if (locationStatus === 'granted') {
      trackNearbySearch(nearbyRadius);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus]);

  // Detect mobile for list view animation variant
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [flyToLocation, setFlyToLocation] = useState<import('../types/Location').Location | null>(null);

  const handleShowOnMap = React.useCallback(() => {
    if (!selectedLocation) return;
    trackShowOnMap(selectedLocation.name);
    setFlyToLocation(selectedLocation);
    if (isMobile) {
      setActiveView('map');
      setSelectedLocation(null);
    }
  }, [selectedLocation, isMobile, setActiveView, setSelectedLocation]);

  // Stable callbacks so Map's marker memo doesn't invalidate unnecessarily
  const handleLocationSelect = React.useCallback((loc: MapLocation) => {
    setSelectedLocation(loc);
    setPreviewLocation(null);
    trackLocationSelect(loc);
  }, [setSelectedLocation, setPreviewLocation]);

  const handleLocationPreview = React.useCallback((loc: MapLocation) => {
    trackLocationPreview(loc.name);
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

  const listProps = {
    locations: filteredLocations,
    onLocationSelect: handleLocationSelect,
    onClearFilters: () => {
      setSelectedCountry(null);
      setSelectedLocationTypes([]);
      clearUserLocation();
    },
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
            trackCountryFilter(country);
          }}
          onToggleLocationType={(type) => {
            const isActive = !selectedLocationTypes.includes(type);
            toggleLocationType(type);
            trackTypeFilter(type, isActive);
          }}
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
            <LocationList
              {...listProps}
              showInlineFilters
              filteredCount={filteredLocations.length}
              selectedCountry={selectedCountry}
              selectedLocationTypes={selectedLocationTypes}
              locationStatus={locationStatus}
              nearbyRadius={nearbyRadius}
              countries={countries}
              onCountrySelect={(country) => {
                setSelectedCountry(country);
                if (country) clearUserLocation();
                trackCountryFilter(country);
              }}
              onToggleLocationType={(type) => {
                const isActive = !selectedLocationTypes.includes(type);
                toggleLocationType(type);
                trackTypeFilter(type, isActive);
              }}
              onClearNearby={clearUserLocation}
              onRequestLocation={requestUserLocation}
              onSetNearbyRadius={setNearbyRadius}
              onClearLocationTypes={() => setSelectedLocationTypes([])}
            />
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          <Map
            locations={filteredLocations}
            zoomLocations={zoomLocations}
            selectedLocation={selectedLocation}
            previewLocation={previewLocation}
            onLocationSelect={handleLocationSelect}
            onLocationPreview={handleLocationPreview}
            onClosePreview={handleClosePreview}
            userLat={userLocation?.lat}
            userLng={userLocation?.lng}
            leftPanelWidth={isMobile ? 0 : 384}
            flyToLocation={flyToLocation}
            onFlyToComplete={() => setFlyToLocation(null)}
            rightPanelWidth={isMobile ? 0 : 384}
          />

          {/* Mobile list overlay — fades in over map */}
          {isMobile && (
            <AnimatePresence>
              {activeView === 'list' && (
                <motion.div
                  key="list-mobile"
                  className="absolute inset-0 z-[9980] bg-white"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
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
          onShowOnMap={handleShowOnMap}
        />
      </div>

      {isMobile && (
        <ViewToggle
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            trackViewToggle(view);
          }}
        />
      )}
    </main>
  );
}
