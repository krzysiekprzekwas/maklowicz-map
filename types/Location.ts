export interface CountryData {
    name: string;
    locations: Location[];
    videos: Video[];
  }

export type LocationType =
  | 'restaurant' | 'cafe' | 'nature' | 'art_culture'
  | 'museum' | 'shopping' | 'hotel' | 'tourist_attraction'
  | 'attraction' | 'other';

export type LocationCharacter = 'historyczny' | 'patriotyczny' | 'religijny' | 'relaks';

export interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    type: LocationType;
    websiteUrl?: string;
    GoogleMapsLink?: string;
    image?: string;
    isFilteredOut?: boolean;
    character?: LocationCharacter[];
}

export interface Video {
    videoId: string;
    videoUrl: string;
    title: string;
    filterTitle: string;
    playlistId: string;
    playlistTitle: string;
    date: string;
    show: string;
    locations: Location[];
}

export interface LocationData {
    videos: Video[];
}