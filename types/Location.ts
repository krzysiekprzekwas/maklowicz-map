export interface Episode {
    title: string;
    date: string;
    show: string;
    youtubeUrl?: string;
    youtubeTitle?: string;
    playlistId: string;
    playlistTitle: string;
}

export type LocationType = 'restaurant' | 'attraction' | 'other';

export interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    cuisine: string[];
    isStillOperating: boolean;
    websiteUrl?: string;
    type: LocationType;
}

export interface Video {
    videoId: string;
    title: string;
    playlistId: string;
    playlistTitle: string;
    date: string;
    show: string;
    locations: Location[];
}

export interface LocationData {
    videos: Video[];
} 