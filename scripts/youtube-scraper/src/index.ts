import { google, youtube_v3 } from 'googleapis';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { GaxiosResponse } from 'googleapis-common';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

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

async function getChannelId(): Promise<string> {
  try {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: 'Robert Makłowicz',
      type: ['channel'],
      maxResults: 1
    });

    if (!response.data.items?.[0]?.id?.channelId) {
      throw new Error('Could not find channel ID');
    }

    return response.data.items[0].id.channelId;
  } catch (error) {
    console.error('Error finding channel:', error);
    throw error;
  }
}

async function getPlaylists(channelId: string): Promise<youtube_v3.Schema$Playlist[]> {
  const playlists: youtube_v3.Schema$Playlist[] = [];
  let pageToken: string | undefined | null = undefined;

  try {
    do {
      const response: GaxiosResponse<youtube_v3.Schema$PlaylistListResponse> = await youtube.playlists.list({
        part: ['snippet'],
        channelId: channelId,
        maxResults: 50,
        pageToken: pageToken || undefined
      });

      const items = response.data.items || [];
      
      items.forEach((item: youtube_v3.Schema$Playlist) => {
        playlists.push(item);
      });

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    return playlists;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

async function getPlaylistVideos(playlistId: string, playlistTitle: string): Promise<Video[]> {
  let pageToken: string | undefined | null = undefined;
  const videos: Video[] = [];

  try {
    do {
      const response: GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse> = await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: pageToken || undefined
      });

      const items = response.data.items || [];
      console.log(`Found ${items.length} videos in playlist ${playlistTitle}`);
      
      // Process all videos in the playlist
      items.forEach(item => {
        if (item.snippet?.resourceId?.videoId) {
          videos.push({
            videoId: item.snippet.resourceId.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            title: item.snippet.title || '',
            playlistId,
            playlistTitle,
            date: item.snippet.publishedAt || new Date().toISOString(),
            show: 'Robert Makłowicz w podróży',
            locations: []
          });
        }
      });

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    if (videos.length === 0) {
      throw new Error('No videos found in playlist');
    }

    return videos;
  } catch (error) {
    console.error(`Error fetching videos for playlist ${playlistTitle}:`, error);
    throw error;
  }
}

async function main() {
  try {
    // Get channel ID
    const channelId = await getChannelId();
    console.log('Found channel ID:', channelId);

    // Get all playlists
    const playlists = await getPlaylists(channelId);
    console.log(`Found ${playlists.length} playlists`);

    // Get all videos from each playlist
    const allVideos: Video[] = [];
    for (const playlist of playlists) {
      if (!playlist.id || !playlist.snippet?.title) continue;
      console.log(`Fetching videos from playlist: ${playlist.snippet.title}`);
      try {
        const playlistVideos = await getPlaylistVideos(playlist.id, playlist.snippet.title);
        allVideos.push(...playlistVideos);
      } catch (error) {
        console.error(`Error processing playlist ${playlist.snippet.title}:`, error);
      }
    }

    console.log(`Successfully processed ${allVideos.length} videos`);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write results to file in the format the app expects
    const outputPath = path.join(outputDir, 'videos.json');
    const locationData: LocationData = { videos: allVideos };
    fs.writeFileSync(outputPath, JSON.stringify(locationData, null, 2));
    console.log(`Videos saved to ${outputPath}`);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main(); 