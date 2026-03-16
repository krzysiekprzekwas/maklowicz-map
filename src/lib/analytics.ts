import posthog from 'posthog-js';

export const trackLocationSelect = (loc: { name: string; type: string; country: string; id: string }) =>
  posthog.capture('location_select', { name: loc.name, type: loc.type, country: loc.country, placeId: loc.id });

export const trackCountryFilter = (country: string | null) =>
  posthog.capture('filter_country', { country: country ?? 'all' });

export const trackTypeFilter = (type: string, active: boolean) =>
  posthog.capture('filter_type', { type, active });

export const trackNearbySearch = (radiusKm: number) =>
  posthog.capture('filter_nearby', { radiusKm });

export const trackViewToggle = (view: 'map' | 'list') =>
  posthog.capture('view_toggle', { view });

export const trackShare = (locationName: string) =>
  posthog.capture('share', { locationName });

export const trackOutboundLink = (destination: 'google_maps' | 'youtube', locationName: string) =>
  posthog.capture('outbound_link', { destination, locationName });

export const trackShowOnMap = (locationName: string) =>
  posthog.capture('show_on_map', { locationName });

export const trackLocationPreview = (locationName: string) =>
  posthog.capture('location_preview', { locationName });
