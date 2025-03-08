export interface Location {
    id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    country: string;
    episode: {
        title: string;
        date: string;
        show: string;
        youtubeUrl?: string;
        youtubeTitle?: string;
    };
    cuisine: string[];
    isStillOperating?: boolean;
    imageUrl?: string;
    websiteUrl?: string;
} 