import axios from 'axios';
import { Client } from '@googlemaps/google-maps-services-js';
import { google } from 'googleapis';
import { GoogleGenAI } from '@google/genai';
import type { Location, Video } from '../../types/Location';
import { generateSlugId } from './adminDataStore';
import { translateCountryName } from './countryTranslations';

async function generateDescription(name: string, country: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) return '';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Stwórz krótką, angażującą opisówkę po polsku (2-3 zdania) o miejscu "${name}", znajdującym się w ${country}. Styl zbliżony do Roberta Makłowicza – gawędziarski, z humorem i nutą kulinarnego uroku, ale bez jego bezpośredniego naśladowania. Nie powtarzaj adresu. Zachowaj narrację w 3. osobie. Podkreśl wyjątkowość tego miejsca. Wspomnij o znaczeniu historycznym lub kulturalnym, jeśli takie istnieje. Jeśli znana jest data powstania budynku – uwzględnij ją.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        systemInstruction: 'You are a helpful assistant that generates engaging descriptions in Polish for places visited by Robert Makłowicz.',
      },
    });
    return response.text?.trim() ?? '';
  } catch {
    return '';
  }
}

function filterTitle(title: string): string {
  const filteredWords = title.split(' ').filter((word) => word !== word.toUpperCase() || /^\d+$/.test(word));
  let result = filteredWords.join(' ');

  const odcMatch = result.match(/odc\.\s*\d+/i);
  if (odcMatch) {
    result = result.replace(odcMatch[0], '').trim();
    result += ` (${odcMatch[0].replace(/odc\.\s*/, 'odc. ')})`;
  }

  return result.replace(/["„]/g, '').trim();
}

function determineLocationType(types: string[]): Location['type'] {
  if (types.includes('restaurant')) return 'restaurant';
  if (types.includes('cafe')) return 'cafe';
  if (types.includes('tourist_attraction')) return 'tourist_attraction';
  if (types.includes('museum')) return 'museum';
  if (types.includes('park') || types.includes('natural_feature')) return 'nature';
  if (types.includes('art_gallery')) return 'art_culture';
  if (types.includes('lodging')) return 'hotel';
  if (types.includes('shopping_mall') || types.includes('store')) return 'shopping';
  if (types.includes('point_of_interest') || types.includes('establishment')) return 'tourist_attraction';
  return 'tourist_attraction';
}

function determineLocationTypeFromName(name: string): Location['type'] {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes('restaurant') ||
    lowerName.includes('cafe') ||
    lowerName.includes('bar') ||
    lowerName.includes('pub') ||
    lowerName.includes('bistro') ||
    lowerName.includes('pizzeria') ||
    lowerName.includes('grill') ||
    lowerName.includes('konoba')
  ) {
    return 'restaurant';
  }
  if (
    lowerName.includes('museum') ||
    lowerName.includes('gallery') ||
    lowerName.includes('park') ||
    lowerName.includes('monument') ||
    lowerName.includes('castle') ||
    lowerName.includes('palace') ||
    lowerName.includes('garden') ||
    lowerName.includes('landmark')
  ) {
    return 'tourist_attraction';
  }
  return 'tourist_attraction';
}

async function resolveShortUrl(url: string): Promise<string> {
  const response = await axios.get(url, {
    maxRedirects: 5,
    validateStatus: (status: number) => status < 400,
  });
  return response.request.res.responseUrl;
}

function extractPlaceId(url: string): string {
  const placeIdMatch = url.match(/place_id=([^&]+)/);
  if (placeIdMatch) return placeIdMatch[1];

  const cidMatch = url.match(/cid=(\d+)/);
  if (cidMatch) return cidMatch[1];

  const placePathMatch = url.match(/place\/([^/]+)\/(@[^/]+)?/);
  if (!placePathMatch) {
    throw new Error('Could not extract place identifier from URL.');
  }

  const name = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' '));
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    return `${name}@${coordsMatch[1]},${coordsMatch[2]}`;
  }
  return name;
}

async function getPlaceDetails(client: Client, placeIdOrName: string): Promise<Location> {
  const coordsMatch = placeIdOrName.match(/(.+)@(-?\d+\.\d+),(-?\d+\.\d+)$/);
  if (coordsMatch) {
    const name = coordsMatch[1];
    const latitude = parseFloat(coordsMatch[2]);
    const longitude = parseFloat(coordsMatch[3]);

    const geocodingResponse = await client.reverseGeocode({
      params: {
        latlng: { lat: latitude, lng: longitude },
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    });
    const place = geocodingResponse.data.results?.[0];
    const countryComponent = place?.address_components?.find((component: { types: string[] }) =>
      component.types.includes('country')
    );

    const translatedCountry = translateCountryName(countryComponent?.long_name || '');
    return {
      id: generateSlugId(name),
      name,
      description: await generateDescription(name, translatedCountry),
      latitude,
      longitude,
      address: place?.formatted_address || '',
      country: translatedCountry,
      type: determineLocationTypeFromName(name),
      websiteUrl: '',
      image: '',
      GoogleMapsLink: '',
    };
  }

  const response = await client.placeDetails({
    params: {
      place_id: placeIdOrName,
      key: process.env.GOOGLE_MAPS_API_KEY || '',
      fields: ['name', 'formatted_address', 'website', 'types', 'geometry', 'address_components'],
    },
  });
  const place = response.data.result;
  const location = place.geometry?.location;

  if (!place.name || !location) {
    throw new Error('Could not resolve place details.');
  }

  const countryComponent = place.address_components?.find((component: { types: string[] }) =>
    component.types.includes('country')
  );

  const translatedCountry = translateCountryName(countryComponent?.long_name || '');
  return {
    id: generateSlugId(place.name),
    name: place.name,
    description: await generateDescription(place.name, translatedCountry),
    latitude: location.lat,
    longitude: location.lng,
    address: place.formatted_address || '',
    country: translatedCountry,
    type: determineLocationType(place.types || []),
    websiteUrl: place.website || '',
    image: '',
    GoogleMapsLink: '',
  };
}

export async function parseGoogleMapsUrl(url: string): Promise<Location> {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY is missing in environment.');
  }

  const client = new Client({});
  const normalized = url.includes('maps.app.goo.gl') || url.includes('goo.gl') ? await resolveShortUrl(url) : url;
  const placeIdOrName = extractPlaceId(normalized);
  const location = await getPlaceDetails(client, placeIdOrName);

  return {
    ...location,
    GoogleMapsLink: url,
  };
}

export async function parseYouTubeVideo(videoUrl: string): Promise<Video> {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is missing in environment.');
  }

  const videoIdMatch = videoUrl.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
  if (!videoIdMatch) {
    throw new Error('Invalid YouTube URL.');
  }

  const videoId = videoIdMatch[1];
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
  });

  const response = await youtube.videos.list({
    id: [videoId],
    part: ['snippet'],
  });

  const item = response.data.items?.[0];
  const snippet = item?.snippet;
  if (!snippet?.title) {
    throw new Error('Could not fetch video metadata from YouTube.');
  }

  return {
    videoId,
    videoUrl,
    title: snippet.title,
    filterTitle: filterTitle(snippet.title),
    playlistId: '',
    playlistTitle: '',
    date: snippet.publishedAt || '',
    show: 'Robert Makłowicz w podróży',
    locations: [],
  };
}
