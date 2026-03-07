import { useMemo } from 'react';
import locationData from '../data/locations.json';
import { haversineDistance } from '../src/lib/distance';
import type { Location, LocationData } from '../types/Location';

const typedData = locationData as LocationData;

export function useLocations(
  selectedCountry: string | null,
  selectedLocationTypes: string[],
  userLat?: number,
  userLng?: number,
  nearbyRadius?: number
) {
  const countries = useMemo(() => {
    const countryMap: Record<string, number> = {};
    typedData.videos.forEach(video =>
      video.locations.forEach(loc => {
        countryMap[loc.country] = (countryMap[loc.country] || 0) + 1;
      })
    );
    return Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const filteredLocations = useMemo(() => {
    let locs = typedData.videos.flatMap(v => v.locations);
    if (selectedCountry)
      locs = locs.filter(l => l.country === selectedCountry);
    if (userLat != null && userLng != null && nearbyRadius != null) {
      locs = locs.filter(l =>
        haversineDistance(userLat, userLng, l.latitude, l.longitude) <= nearbyRadius
      );
    }
    if (selectedLocationTypes.length)
      locs = locs.filter(l => selectedLocationTypes.includes(l.type));
    return locs.map(l => ({ ...l, isFilteredOut: false }));
  }, [selectedCountry, selectedLocationTypes, userLat, userLng, nearbyRadius]);

  const locationTypeCounts = useMemo(() => {
    const base = selectedCountry
      ? typedData.videos.flatMap(v => v.locations).filter(l => l.country === selectedCountry)
      : typedData.videos.flatMap(v => v.locations);
    return base.reduce<Record<string, number>>((acc, l) => {
      acc[l.type] = (acc[l.type] || 0) + 1;
      return acc;
    }, {});
  }, [selectedCountry]);

  const allLocations = useMemo(
    () => typedData.videos.flatMap(v => v.locations),
    []
  );

  return { countries, filteredLocations, locationTypeCounts, allLocations };
}
