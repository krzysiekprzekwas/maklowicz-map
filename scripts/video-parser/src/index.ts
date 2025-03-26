import * as path from 'path';
import * as dotenv from 'dotenv';
import { google, youtube_v3 } from 'googleapis';
import { Video } from '../../../types/Location';

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

function filterTitle(title: string): string {
  // Remove all words written fully in capital letters, but keep numbers
  const filteredWords = title.split(' ').filter(word => {
    // Check if the word is fully uppercase and not a number
    return word !== word.toUpperCase() || /^\d+$/.test(word);
  });
  let result = filteredWords.join(' ');

  // Move "odc." and its number to the end, format it, and wrap in parentheses
  const odcMatch = result.match(/odc\.\s*\d+/i);
  if (odcMatch) {
    result = result.replace(odcMatch[0], '').trim();
    result += ` (${odcMatch[0].replace(/odc\.\s*/, 'odc. ')})`;
  }

  // Remove double quotes
  result = result.replace(/"/g, '').trim();

  return result;
}

async function fetchYouTubeVideoDetails(videoUrl: string): Promise<Video> {
  const videoIdMatch = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube video URL');
  }

  const videoId = videoIdMatch[1];
  const apiKey = process.env.YOUTUBE_API_KEY;

  const youtube = google.youtube({
    version: 'v3',
    auth: apiKey,
  });

  try {
    // Fetch video details
    const response = await youtube.videos.list({
      id: [videoId],
      part: ['snippet', 'contentDetails'],
    });

    const videoData = response.data.items?.[0];
    if (!videoData) {
      throw new Error('Video not found');
    }

    const snippet = videoData.snippet!;
    const playlistId = '';
    const playlistTitle = '';
    const title = snippet.title!;
    const filterTitleResult = filterTitle(title);
    const date = snippet.publishedAt!;
    const show = 'Robert Makłowicz w podróży';

    return {
      videoId,
      videoUrl,
      title,
      filterTitle: filterTitleResult,
      playlistId,
      playlistTitle,
      date,
      show,
      locations: [],
    };
  } catch (error) {
    console.error('Error fetching video details:', error.message);
    throw error;
  }
}

async function main() {
  const videoUrl = process.argv[2];
  if (!videoUrl) {
    console.error('Please provide a YouTube video URL as an argument');
    process.exit(1);
  }

  if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'your_api_key_here') {
    console.error('Please set a valid YOUTUBE_API_KEY in your .env file');
    process.exit(1);
  }

  try {
    const videoData = await fetchYouTubeVideoDetails(videoUrl);

    console.log('\nGenerated Video Object:');
    console.log(JSON.stringify(videoData, null, 2));
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

main();
