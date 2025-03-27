import { useState } from 'react';
import type { Location } from '../types/Location';

export function useLocationState() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setSelectedVideo(null);
  };

  const handleVideoClick = (videoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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
    searchQuery,
    setSearchQuery,
    handleCountryClick,
    handleVideoClick,
  };
}
