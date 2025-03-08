export interface Episode {
    title: string;
    date: string;
    show: string;
    youtubeUrl?: string;
    youtubeTitle?: string;
    playlistId: string;
    playlistTitle: string;
}

export interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    episode: Episode;
    cuisine: string[];
    isStillOperating?: boolean;
    imageUrl?: string;
    websiteUrl?: string;
} 