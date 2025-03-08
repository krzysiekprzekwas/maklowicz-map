import * as fs from 'fs';
import * as path from 'path';

type LocationType = 'restaurant' | 'attraction' | 'other';

interface Location {
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

interface Video {
  videoId: string;
  videoUrl: string;
  title: string;
  playlistId: string;
  playlistTitle: string;
  date: string;
  show: string;
  locations: Location[];
}

interface LocationData {
  videos: Video[];
}

// Read the current videos.json
const videosPath = path.join(__dirname, '..', 'output', 'videos.json');
const newData = JSON.parse(fs.readFileSync(videosPath, 'utf8')) as LocationData;

// Read the existing locations.json
const locationsPath = path.join(__dirname, '..', '..', '..', 'data', 'locations.json');
let existingData: LocationData;

try {
  existingData = JSON.parse(fs.readFileSync(locationsPath, 'utf8')) as LocationData;
} catch (error) {
  console.log('No existing locations.json found or invalid JSON, creating new file');
  existingData = { videos: [] };
}

// Create a map of existing videos by videoId to preserve their locations
const existingVideosMap = new Map<string, Video>();
existingData.videos.forEach(video => {
  if (video.locations.length > 0) {
    existingVideosMap.set(video.videoId, video);
  }
});

// Merge new videos with existing locations
const mergedVideos = newData.videos.map(newVideo => {
  const existingVideo = existingVideosMap.get(newVideo.videoId);
  if (existingVideo) {
    // Preserve existing locations for this video
    return {
      ...newVideo,
      locations: existingVideo.locations
    };
  }
  return newVideo;
});

// Write back to locations.json
const outputData: LocationData = { videos: mergedVideos };
fs.writeFileSync(locationsPath, JSON.stringify(outputData, null, 2));

console.log(`Merged ${newData.videos.length} videos with ${existingVideosMap.size} existing videos with locations`);
console.log(`Total videos in output: ${mergedVideos.length}`); 