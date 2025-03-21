import { useMemo } from 'react';
import type { CountryData, LocationType } from '../types/Location';
import locationData from '../data/locations.json';

export function useLocations(searchQuery: string, selectedCountry: string | null, selectedVideo: string | null) {
  const countries = useMemo(() => {
    const countryMap: Record<string, CountryData> = {};
    const query = searchQuery.toLowerCase().trim();

    locationData.videos.forEach((video) => {
      const videoMatches = !query || video.title.toLowerCase().includes(query);
      const matchingLocations = video.locations.filter((loc) =>
        [loc.name, loc.country, loc.description, loc.address].some((field) =>
          field.toLowerCase().includes(query)
        ) || videoMatches
      );

      matchingLocations.forEach((location) => {

        if (!countryMap[location.country]) {
          countryMap[location.country] = { name: location.country, locations: [], videos: [] };
        }

        if (!countryMap[location.country].locations.some((l) => l.id === location.id)) {
          countryMap[location.country].locations.push(location);
        }

        const existingVideo = countryMap[location.country].videos.find((v) => v.videoId === video.videoId);
        if (!existingVideo) {
          countryMap[location.country].videos.push({
            ...video,
            filterTitle: video.filterTitle || '',
            locations: matchingLocations,
          });
        }
      });
    });

    return Object.values(countryMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchQuery]);

  const filteredLocations = useMemo(() => {
    if (selectedVideo) {
      return locationData.videos.find((v) => v.videoId === selectedVideo)?.locations || [];
    }

    if (selectedCountry) {
      return countries.find((c) => c.name === selectedCountry)?.locations || [];
    }

    return locationData.videos.flatMap((video) =>
      video.locations
    );
  }, [selectedCountry, selectedVideo, countries]);
  
  const videoCount = useMemo(() => {
    return locationData.videos.filter((video) => video.locations && video.locations.length > 0).length;
  }, []);
  const totalLocations = useMemo(
    () => locationData.videos.reduce((acc, video) => acc + video.locations.length, 0),
    []
  );

  return { countries, filteredLocations, totalLocations, videoCount};
}
