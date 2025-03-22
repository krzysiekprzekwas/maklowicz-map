export interface CountryData {
    name: string;
    locations: Location[];
    videos: Video[];
  }

export interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    type: string;
    websiteUrl?: string;
    GoogleMapsLink?: string;
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