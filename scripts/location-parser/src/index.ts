import * as path from 'path';
import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Location } from '../../../types/Location';

import {GoogleGenAI} from '@google/genai';
// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Check for the -d flag in command-line arguments
const debugEnabled = process.argv.includes('-d');

// Conditionally enable or disable console.debug
if (!debugEnabled) {
  console.debug = () => {};
}

const countryTranslations: Record<string, string> = {
  "United States": "Stany Zjednoczone",
  "Germany": "Niemcy",
  "France": "Francja",
  "Italy": "Włochy",
  "Spain": "Hiszpania",
  "Poland": "Polska",
  "United Kingdom": "Wielka Brytania",
  "Canada": "Kanada",
  "Australia": "Australia",
  "Japan": "Japonia",
  "Jordan": "Jordania",
  "China": "Chiny",
  "Austria": "Austria",
  "Belgium": "Belgia",
  "Czech Republic": "Czechy",
  "Denmark": "Dania",
  "Estonia": "Estonia",
  "Finland": "Finlandia",
  "Greece": "Grecja",
  "Hungary": "Węgry",
  "Iceland": "Islandia",
  "Ireland": "Irlandia",
  "Latvia": "Łotwa",
  "Lithuania": "Litwa",
  "Luxembourg": "Luksemburg",
  "Netherlands": "Holandia",
  "Norway": "Norwegia",
  "Portugal": "Portugalia",
  "Romania": "Rumunia",
  "Slovakia": "Słowacja",
  "Slovenia": "Słowenia",
  "Sweden": "Szwecja",
  "Switzerland": "Szwajcaria",
  "Turkey": "Turcja",
  "Tunisia": "Tunezja",
  "Ukraine": "Ukraina",
  "Russia": "Rosja",
  "Croatia": "Chorwacja",
  "Serbia": "Serbia",
  "Bosnia and Herzegovina": "Bośnia i Hercegowina",
  "Montenegro": "Czarnogóra",
  "Albania": "Albania",
  "Bulgaria": "Bułgaria",
  "Moldova": "Mołdawia",
  "Belarus": "Białoruś",
  "Malta": "Malta",
  "Cyprus": "Cypr",
  "Andorra": "Andora",
  "Monaco": "Monako",
  "Liechtenstein": "Liechtenstein",
  "San Marino": "San Marino",
  "Vatican City": "Watykan",
};

function translateCountryName(country: string): string {
  return countryTranslations[country] || country;
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

function generateId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function determineLocationType(types: string[]): 'restaurant' | 'attraction' | 'other' {
  if (types.includes('restaurant') || types.includes('food') || types.includes('cafe') || types.includes('bar')) {
    return 'restaurant';
  }
  if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('park') || 
      types.includes('point_of_interest') || types.includes('establishment')) {
    return 'attraction';
  }
  return 'other';
}

function determineLocationTypeFromName(name: string): 'restaurant' | 'attraction' | 'other' {
  const lowerName = name.toLowerCase();
  
  // Check for restaurant-related keywords
  if (
    lowerName.includes('restaurant') || 
    lowerName.includes('cafe') || 
    lowerName.includes('bar') || 
    lowerName.includes('pub') || 
    lowerName.includes('bistro') || 
    lowerName.includes('pizzeria') || 
    lowerName.includes('pizza') ||
    lowerName.includes('food') ||
    lowerName.includes('grill') ||
    lowerName.includes('eatery') ||
    lowerName.includes('konoba')
  ) {
    return 'restaurant';
  }
  
  // Check for attraction-related keywords
  if (
    lowerName.includes('museum') || 
    lowerName.includes('gallery') || 
    lowerName.includes('park') || 
    lowerName.includes('monument') || 
    lowerName.includes('castle') || 
    lowerName.includes('palace') || 
    lowerName.includes('garden') ||
    lowerName.includes('attraction') ||
    lowerName.includes('landmark') ||
    lowerName.includes('memorial')
  ) {
    return 'attraction';
  }
  
  return 'other';
}

async function resolveShortUrl(url: string): Promise<string> {
  try {
    console.debug('Resolving shortened URL...');
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400
    });
    console.debug('Resolved URL:', response.request.res.responseUrl);
    return response.request.res.responseUrl;
  } catch (error) {
    console.error('Error resolving short URL:', error);
    throw new Error('Could not resolve shortened URL');
  }
}

async function extractPlaceId(url: string): Promise<string> {
  // Try to extract place ID directly from URL
  const placeIdMatch = url.match(/place_id=([^&]+)/);
  if (placeIdMatch) {
    return placeIdMatch[1];
  }
  
  // If not found, try to extract from the CID parameter
  const cidMatch = url.match(/cid=(\d+)/);
  if (cidMatch) {
    return cidMatch[1];
  }
  
  // Extract from the place path
  const placePathMatch = url.match(/place\/([^\/]+)\/(@[^\/]+)?/);
  if (placePathMatch) {
    // This is not an actual place ID but a name, we'll need to use geocoding
    const name = decodeURIComponent(placePathMatch[1].replace(/\+/g, ' '));
    
    // Extract coordinates if available
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordsMatch) {
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[2]);
      console.debug(`Extracted name: ${name} and coordinates: ${lat},${lng}`);
      
      // Use the coordinates and name to create a unique identifier
      return `${name}@${lat},${lng}`;
    }
    
    return name;
  }
  
  throw new Error('Could not extract place ID or name from URL');
}

async function generateDescription(location: Location): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in .env file');
      return '';
    }

    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    const prompt = `Stwórz krótką, angażującą opisówkę po polsku (2-3 zdania) o miejscu "${location.name}", znajdującym się w ${location.country}. Styl zbliżony do Roberta Makłowicza – gawędziarski, z humorem i nutą kulinarnego uroku, ale bez jego bezpośredniego naśladowania. Nie powtarzaj adresu. Zachowaj narrację w 3. osobie. Podkreśl wyjątkowość tego miejsca. Wspomnij o znaczeniu historycznym lub kulturalnym, jeśli takie istnieje. Jeśli znana jest data powstania budynku – uwzględnij ją.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.5,
        systemInstruction: "You are a helpful assistant that generates engaging descriptions in Polish for places visited by Robert Makłowicz.",
      },
    });

    return response.text.trim();
  } catch (error: any) {
    console.error('Error generating description:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    return '';
  }
}

async function getPlaceDetails(client: Client, placeIdOrName: string): Promise<Location> {
  console.debug('Getting place details for:', placeIdOrName);
  
  try {
    // Check if we have coordinates in the ID
    const coordsMatch = placeIdOrName.match(/(.+)@(-?\d+\.\d+),(-?\d+\.\d+)$/);
    
    if (coordsMatch) {
      const name = coordsMatch[1];
      const latitude = parseFloat(coordsMatch[2]);
      const longitude = parseFloat(coordsMatch[3]);
      
      // Try geocoding with the coordinates first
      try {
        console.debug('Trying reverse geocoding with coordinates...');
        const geocodingResponse = await client.reverseGeocode({
          params: {
            latlng: { lat: latitude, lng: longitude },
            key: process.env.GOOGLE_MAPS_API_KEY || ''
          }
        });
        
        if (geocodingResponse.data.results && geocodingResponse.data.results.length > 0) {
          const place = geocodingResponse.data.results[0];
          
          // Get country from address components
          const countryComponent = place.address_components.find((component: any) => 
            component.types.includes('country' as any)
          );
          const country = countryComponent?.long_name || '';
          const type = determineLocationTypeFromName(name);
          
          
          return {
            id: generateId(name),
            name: name,
            description: "",
            latitude,
            longitude,
            address: place.formatted_address || '',
            country,
            type,
            websiteUrl: ''
          };
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }
      
      // Fallback to just using the coordinates and name
      console.debug('Using basic information from URL');
      const type = determineLocationTypeFromName(name);
      
      return {
        id: '',
        name,
        description: "",
        latitude,
        longitude,
        address: '',
        country: '',
        type,
        websiteUrl: ''
      };
    }
    
    // Try to use place details API if we have a proper place ID
    if (!/^[A-Za-z\s]+$/.test(placeIdOrName)) {
      try {
        console.debug('Trying place details API...');
        const response = await client.placeDetails({
          params: {
            place_id: placeIdOrName,
            key: process.env.GOOGLE_MAPS_API_KEY || '',
            fields: ['name', 'formatted_address', 'website', 'types', 'geometry', 'address_components']
          }
        });
        
        const place = response.data.result;
        const location = place.geometry?.location;
        
        if (!location) {
          throw new Error('Could not find location coordinates');
        }
        
        if (!place.name) {
          throw new Error('Could not find place name');
        }
        
        // Get country from address components
        const countryComponent = (place.address_components as AddressComponent[] || []).find(component => 
          component.types.includes('country' as any)
        );
        const country = countryComponent?.long_name || '';
        const type = determineLocationType(place.types || []);
        
        return {
          id: generateId(place.name),
          name: place.name,
          description: "",
          latitude: location.lat,
          longitude: location.lng,
          address: place.formatted_address || '',
          country,
          type,
          websiteUrl: place.website || ''
        };
      } catch (error) {
        console.error('Place details API failed:', error);
      }
    }
    
    throw new Error('Could not find place details');
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
}

async function parseGoogleMapsUrl(url: string): Promise<Location> {
  const client = new Client({});

  // Handle shortened URLs
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
    url = await resolveShortUrl(url);
  }

  try {
    // Extract place ID or name from URL
    const placeIdOrName = await extractPlaceId(url);
    console.debug('Extracted place ID or name:', placeIdOrName);
    
    // Get place details
    return await getPlaceDetails(client, placeIdOrName);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing URL:', error.message);
    } else {
      console.error('Unknown error processing URL');
    }
    
    // Fallback to basic extraction from URL
    console.debug('Falling back to basic URL extraction...');
    
    // Extract place name from URL
    const nameMatch = url.match(/place\/([^\/]+)/);
    if (!nameMatch) {
      throw new Error('Could not find place name in URL');
    }
    
    const encodedName = nameMatch[1];
    const name = decodeURIComponent(encodedName.replace(/\+/g, ' '));
    console.debug('Extracted place name:', name);
    
    // Extract coordinates from URL
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!coordsMatch) {
      throw new Error('Could not find coordinates in URL');
    }
    
    const latitude = parseFloat(coordsMatch[1]);
    const longitude = parseFloat(coordsMatch[2]);
    console.debug('Extracted coordinates:', latitude, longitude);
    
    // Try to get country from URL or set a default
    let country = '';
    // Look for country code in URL
    const countryMatch = url.match(/&gl=([A-Za-z]{2})/);
    if (countryMatch) {
      country = countryMatch[1].toUpperCase();
    }
    
    return {
      id: '',
      name,
      description: '',
      latitude,
      longitude,
      address: '',
      country,
      type: determineLocationTypeFromName(name),
      websiteUrl: ''
    };
  }
}

function createLocation(data: Location, link: string): Location {
  return {
    id: generateId(data.name),
    name: data.name,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    country: translateCountryName(data.country),
    type: data.type,
    websiteUrl: data.websiteUrl,
    image: '',
    GoogleMapsLink: link
  };
}

async function main() {
  const url = process.argv[2];
  if (!url || url === '-d') { 
    console.error('Please provide a Google Maps URL as an argument');
    process.exit(1);
  }

  if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === 'your_api_key_here') {
    console.error('Please set a valid GOOGLE_MAPS_API_KEY in your .env file');
    process.exit(1);
  }

  try {
    const mapsData = await parseGoogleMapsUrl(url);
    const location = createLocation(mapsData, url);

    const description = await generateDescription(location);

    location.description = description;

    console.log('\nLocation data:');
    console.log(JSON.stringify(location, null, 2));
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

