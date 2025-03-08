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

interface Video {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  playlistId: string;
  playlistTitle: string;
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
  const videos: Video[] = [];
  let pageToken: string | undefined | null = undefined;

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
      
      for (const item of items) {
        if (item.snippet?.resourceId?.videoId && item.snippet.title) {
          videos.push({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description || '',
            publishedAt: item.snippet.publishedAt || '',
            playlistId,
            playlistTitle
          });
        }
      }

      pageToken = response.data.nextPageToken;
    } while (pageToken);

    console.log(`Total videos in playlist ${playlistTitle}: ${videos.length}`);
    return videos;
  } catch (error) {
    console.error(`Error fetching videos for playlist ${playlistTitle}:`, error);
    return [];
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

    // Get videos from each playlist
    const videos: Video[] = [];
    for (const playlist of playlists) {
      if (!playlist.id || !playlist.snippet?.title) continue;
      console.log(`Fetching videos from playlist: ${playlist.snippet.title}`);
      const playlistVideos = await getPlaylistVideos(playlist.id, playlist.snippet.title);
      videos.push(...playlistVideos);
      console.log(`Total videos so far: ${videos.length}`);
    }

    console.log(`Successfully scraped ${videos.length} videos`);
    console.log('First video:', videos[0]);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write results to file
    const outputPath = path.join(outputDir, 'videos.json');
    fs.writeFileSync(outputPath, JSON.stringify({ videos }, null, 2));
    console.log(`Videos saved to ${outputPath}`);
  } catch (error) {
    console.error('Error in main:', error);
  }
}

main(); 