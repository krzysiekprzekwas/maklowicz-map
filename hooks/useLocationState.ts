import { useState } from 'react';
import type { Location } from '../types/Location';

export function useLocationState() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState(new Set<string>());
  const [expandedVideos, setExpandedVideos] = useState(new Set<string>());
  const [searchQuery, setSearchQuery] = useState('');

  const handleCountryClick = (countryName: string) => {
    setExpandedCountries((prev) => {
      const newSet = new Set(prev);
      newSet.has(countryName) ? newSet.delete(countryName) : newSet.add(countryName);
      return newSet;
    });
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setSelectedVideo(null);
  };

  const handleVideoClick = (videoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.has(videoId) ? newSet.delete(videoId) : newSet.add(videoId);
      return newSet;
    });
    setSelectedVideo(videoId === selectedVideo ? null : videoId);
  };

  return {
    selectedLocation,
    setSelectedLocation,
    selectedCountry,
    setSelectedCountry,
    selectedVideo,
    setSelectedVideo,
    isFiltersOpen,
    setIsFiltersOpen,
    expandedCountries,
    expandedVideos,
    searchQuery,
    setSearchQuery,
    handleCountryClick,
    handleVideoClick,
  };
}
