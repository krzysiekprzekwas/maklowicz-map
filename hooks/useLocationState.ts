import { useState } from 'react';
import type { Location } from '../types/Location';

export function useLocationState() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'granted' | 'denied'>('idle');
  const [nearbyRadius, setNearbyRadius] = useState(50);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setPreviewLocation(null);
  };

  const toggleLocationType = (type: string) => {
    setSelectedLocationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const requestUserLocation = () => {
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus('granted');
        setSelectedCountry(null);
      },
      () => {
        setLocationStatus('denied');
        setUserLocation(null);
      }
    );
  };

  const clearUserLocation = () => {
    setUserLocation(null);
    setLocationStatus('idle');
  };

  return {
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
    handleCountryClick,
    toggleLocationType,
    userLocation,
    locationStatus,
    nearbyRadius,
    setNearbyRadius,
    requestUserLocation,
    clearUserLocation,
  };
}
