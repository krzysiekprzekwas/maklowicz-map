import { useEffect, useState } from 'react';
import type { Location } from '../types/Location';

export function useLocationState() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [favouriteLocationIds, setFavouriteLocationIds] = useState<string[]>([null]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavouriteLocationIds(storedFavorites);
  }, []);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setSelectedVideo(null);
  };

  const handleVideoClick = (videoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedVideo(videoId === selectedVideo ? null : videoId);
  };

  const addFavouriteLocation = (locationId: string) => {
    const updatedFavorites = [...favouriteLocationIds, locationId];
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavouriteLocationIds(updatedFavorites)
  };

  const removeFavouriteLocation = (locationId: string) => {
    const updatedFavorites = favouriteLocationIds.filter((id: string) => id !== locationId);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setFavouriteLocationIds(updatedFavorites)
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
    favouriteLocationIds,
    addFavouriteLocation,
    removeFavouriteLocation,
    handleCountryClick,
    handleVideoClick
  };
}
