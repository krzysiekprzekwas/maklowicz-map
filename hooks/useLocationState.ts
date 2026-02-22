import { useEffect, useState } from 'react';
import type { Location } from '../types/Location';

export function useLocationState() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [favouriteLocationIds, setFavouriteLocationIds] = useState<string[]>([null]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavouriteLocationIds(storedFavorites);
  }, []);

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setPreviewLocation(null);
  };

  const toggleLocationType = (type: string) => {
    setSelectedLocationTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCharacter = (char: string) => {
    setSelectedCharacters(prev =>
      prev.includes(char) ? prev.filter(c => c !== char) : [...prev, char]
    );
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
    favouriteLocationIds,
    addFavouriteLocation,
    removeFavouriteLocation,
    handleCountryClick,
    toggleLocationType,
    toggleCharacter,
  };
}
