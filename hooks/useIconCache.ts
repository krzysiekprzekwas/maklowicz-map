import { useRef, useCallback } from 'react';
import { DivIcon } from 'leaflet';
import createCustomIcon from '../components/location/LocationMapIcon';
import type { LocationType } from '../types/Location';

/**
 * Hook to cache marker icons for better performance
 * Prevents recreating the same icon instances on every render
 */
export function useIconCache() {
  const iconCache = useRef<Map<string, DivIcon>>(new Map());

  const getIcon = useCallback((
    type: LocationType,
    title: string,
    isSelected: boolean,
    isFilteredOut: boolean,
    isMobile: boolean
  ): DivIcon => {
    // Create a unique cache key based on icon properties
    const cacheKey = `${type}-${isSelected ? 'selected' : 'normal'}-${isFilteredOut ? 'filtered' : 'active'}-${isMobile ? 'mobile' : 'desktop'}`;
    
    // Check if icon exists in cache
    if (iconCache.current.has(cacheKey)) {
      return iconCache.current.get(cacheKey)!;
    }

    // Create new icon and cache it
    // Note: We don't include title in cache key for better reuse
    // Title is only shown on hover anyway
    const icon = createCustomIcon(type, '', isSelected, isFilteredOut, isMobile);
    iconCache.current.set(cacheKey, icon);

    return icon;
  }, []);

  // Clear cache function (useful for debugging or if needed)
  const clearCache = useCallback(() => {
    iconCache.current.clear();
  }, []);

  return { getIcon, clearCache };
}
