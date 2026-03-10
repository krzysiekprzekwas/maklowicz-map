import { track } from '@vercel/analytics';

export const trackLocationSelect = (loc: { name: string; type: string; country: string; id: string }) =>
  track('location_select', { name: loc.name, type: loc.type, country: loc.country, placeId: loc.id });

export const trackCountryFilter = (country: string | null) =>
  track('filter_country', { country: country ?? 'all' });

export const trackTypeFilter = (type: string, active: boolean) =>
  track('filter_type', { type, active });

export const trackNearbySearch = (radiusKm: number) =>
  track('filter_nearby', { radiusKm });

export const trackViewToggle = (view: 'map' | 'list') =>
  track('view_toggle', { view });

export const trackShare = (locationName: string) =>
  track('share', { locationName });

export const trackOutboundLink = (destination: 'google_maps' | 'youtube', locationName: string) =>
  track('outbound_link', { destination, locationName });
