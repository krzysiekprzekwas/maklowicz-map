import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
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
    trackShowOnMap(selectedLocation.id);
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
    trackLocationPreview(loc);
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

  // Auto-trigger nearby geolocation when navigated from landing with ?nearby=1
  React.useEffect(() => {
    if (!router.isReady) return;
    if (router.query.nearby === '1' && locationStatus === 'idle') {
      requestUserLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.nearby]);

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

  // Shared filter callbacks
  const filterHandlers = {
    onCountrySelect: (country: string | null) => {
      setSelectedCountry(country);
      if (country) clearUserLocation();
      trackCountryFilter(country);
    },
    onToggleLocationType: (type: string) => {
      const isActive = !selectedLocationTypes.includes(type);
      toggleLocationType(type);
      trackTypeFilter(type, isActive);
    },
    onToggleFilters: () => setIsFiltersOpen(!isFiltersOpen),
    onResetFilters: () => {
      setSelectedCountry(null);
      setSelectedLocationTypes([]);
      clearUserLocation();
    },
    onRequestLocation: requestUserLocation,
    onSetNearbyRadius: setNearbyRadius,
    onClearNearby: clearUserLocation,
  };

  const filterProps = {
    isOpen: isFiltersOpen,
    countries,
    selectedCountry,
    selectedLocationTypes,
    filteredCount: filteredLocations.length,
    locationTypeCounts,
    locationStatus,
    nearbyRadius,
    ...filterHandlers,
  };

  return (
    <main className="flex-1 flex flex-col bg-bg-primary overflow-hidden">
      {selectedLocation && (
        <Head>
          <title>{`${selectedLocation.name} | Śladami Roberta Makłowicza`}</title>
        </Head>
      )}

      {/* Desktop top bar — logo + search + filter button */}
      {!isMobile && (
        <div className="flex-shrink-0 flex items-center gap-4 pl-8 pr-4 py-2 bg-bg-primary border-b border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-[10000]">
          <Link href="/" className="flex-shrink-0">
            <img src="/main_mobile_header.svg" alt="Śladami Roberta Makłowicza" className="h-14" />
          </Link>
          <div className="flex-1 max-w-[400px] mx-auto">
            <Filters {...filterProps} variant="inline" />
          </div>
        </div>
      )}

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile: overlay search bar + filter sheet */}
        {isMobile && (
          <Filters {...filterProps} variant="overlay" />
        )}

        {/* Desktop list panel — permanent, always visible */}
        {!isMobile && (
          <div className="w-96 flex-shrink-0 h-full overflow-hidden bg-bg-primary shadow-xl flex flex-col">
            <LocationList
              {...listProps}
              filteredCount={filteredLocations.length}
              selectedCountry={selectedCountry}
              selectedLocationTypes={selectedLocationTypes}
              onToggleLocationType={filterHandlers.onToggleLocationType}
              isNearby={locationStatus === 'granted'}
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
                  <LocationList {...listProps} filteredCount={filteredLocations.length} selectedCountry={selectedCountry} topPadding />
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
