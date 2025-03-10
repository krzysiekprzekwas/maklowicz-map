import * as fs from 'fs';
import * as path from 'path';
import { Client } from '@googlemaps/google-maps-services-js';
import * as dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Define our own Location interface without requiring isStillOperating
interface LocationOutput {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  country: string;
  type: 'restaurant' | 'attraction' | 'other';
  websiteUrl?: string;
}

interface GoogleMapsData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  country: string;
  type: 'restaurant' | 'attraction' | 'other';
  websiteUrl?: string;
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
    lowerName.includes('eatery')
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
    console.log('Resolving shortened URL...');
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: (status: number) => status < 400
    });
    console.log('Resolved URL:', response.request.res.responseUrl);
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
      console.log(`Extracted name: ${name} and coordinates: ${lat},${lng}`);
      
      // Use the coordinates and name to create a unique identifier
      return `${name}@${lat},${lng}`;
    }
    
    return name;
  }
  
  throw new Error('Could not extract place ID or name from URL');
}

async function getPlaceDetails(client: Client, placeIdOrName: string): Promise<GoogleMapsData> {
  console.log('Getting place details for:', placeIdOrName);
  
  try {
    // Check if we have coordinates in the ID
    const coordsMatch = placeIdOrName.match(/(.+)@(-?\d+\.\d+),(-?\d+\.\d+)$/);
    
    if (coordsMatch) {
      const name = coordsMatch[1];
      const latitude = parseFloat(coordsMatch[2]);
      const longitude = parseFloat(coordsMatch[3]);
      
      // Try geocoding with the coordinates first
      try {
        console.log('Trying reverse geocoding with coordinates...');
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
          
          return {
            name: name, // Keep the original name from the URL
            description: '',
            latitude,
            longitude,
            address: place.formatted_address || '',
            country,
            type: determineLocationTypeFromName(name),
            websiteUrl: ''
          };
        }
      } catch (error) {
        console.log('Reverse geocoding failed:', error);
      }
      
      // Try to get more details using nearby search
      try {
        console.log('Trying nearby search...');
        const nearbyResponse = await client.placesNearby({
          params: {
            location: { lat: latitude, lng: longitude },
            radius: 100,
            keyword: name,
            key: process.env.GOOGLE_MAPS_API_KEY || ''
          }
        });
        
        if (nearbyResponse.data.results && nearbyResponse.data.results.length > 0) {
          const place = nearbyResponse.data.results[0];
          return {
            name: place.name || name,
            description: '',
            latitude: place.geometry?.location.lat || latitude,
            longitude: place.geometry?.location.lng || longitude,
            address: place.vicinity || '',
            country: '', // Can't get country from nearby search
            type: determineLocationType(place.types || []),
            websiteUrl: ''
          };
        }
      } catch (error) {
        console.log('Nearby search failed:', error);
      }
      
      // Fallback to just using the coordinates and name
      console.log('Using basic information from URL');
      return {
        name,
        description: '',
        latitude,
        longitude,
        address: '',
        country: '',
        type: determineLocationTypeFromName(name),
        websiteUrl: ''
      };
    }
    
    // Try to use place details API if we have a proper place ID
    if (!/^[A-Za-z\s]+$/.test(placeIdOrName)) {
      try {
        console.log('Trying place details API...');
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
        
        return {
          name: place.name,
          description: '',
          latitude: location.lat,
          longitude: location.lng,
          address: place.formatted_address || '',
          country,
          type: determineLocationType(place.types || []),
          websiteUrl: place.website || ''
        };
      } catch (error) {
        console.log('Place details API failed:', error);
        // Continue to geocoding as fallback
      }
    }
    
    // Use geocoding as a fallback
    try {
      console.log('Trying geocoding with address...');
      const geocodingResponse = await client.geocode({
        params: {
          address: placeIdOrName,
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });
      
      if (geocodingResponse.data.results && geocodingResponse.data.results.length > 0) {
        const place = geocodingResponse.data.results[0];
        const location = place.geometry?.location;
        
        if (!location) {
          throw new Error('Could not find location coordinates');
        }
        
        // Get country from address components
        const countryComponent = place.address_components.find((component: any) => 
          component.types.includes('country' as any)
        );
        const country = countryComponent?.long_name || '';
        
        return {
          name: placeIdOrName,
          description: '',
          latitude: location.lat,
          longitude: location.lng,
          address: place.formatted_address || '',
          country,
          type: determineLocationTypeFromName(placeIdOrName),
          websiteUrl: ''
        };
      }
    } catch (error) {
      console.log('Geocoding failed:', error);
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

async function parseGoogleMapsUrl(url: string): Promise<GoogleMapsData> {
  const client = new Client({});

  // Handle shortened URLs
  if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
    url = await resolveShortUrl(url);
  }

  try {
    // Extract place ID or name from URL
    const placeIdOrName = await extractPlaceId(url);
    console.log('Extracted place ID or name:', placeIdOrName);
    
    // Get place details
    return await getPlaceDetails(client, placeIdOrName);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing URL:', error.message);
    } else {
      console.error('Unknown error processing URL');
    }
    
    // Fallback to basic extraction from URL
    console.log('Falling back to basic URL extraction...');
    
    // Extract place name from URL
    const nameMatch = url.match(/place\/([^\/]+)/);
    if (!nameMatch) {
      throw new Error('Could not find place name in URL');
    }
    
    const encodedName = nameMatch[1];
    const name = decodeURIComponent(encodedName.replace(/\+/g, ' '));
    console.log('Extracted place name:', name);
    
    // Extract coordinates from URL
    const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (!coordsMatch) {
      throw new Error('Could not find coordinates in URL');
    }
    
    const latitude = parseFloat(coordsMatch[1]);
    const longitude = parseFloat(coordsMatch[2]);
    console.log('Extracted coordinates:', latitude, longitude);
    
    // Try to get country from URL or set a default
    let country = '';
    // Look for country code in URL
    const countryMatch = url.match(/&gl=([A-Za-z]{2})/);
    if (countryMatch) {
      country = countryMatch[1].toUpperCase();
    }
    
    return {
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

function createLocation(data: GoogleMapsData): LocationOutput {
  return {
    id: generateId(data.name),
    name: data.name,
    description: data.description,
    latitude: data.latitude,
    longitude: data.longitude,
    address: data.address,
    country: data.country,
    type: data.type,
    websiteUrl: data.websiteUrl
  };
}

async function main() {
  // Get URL from command line argument
  const url = process.argv[2];
  if (!url) {
    console.error('Please provide a Google Maps URL as an argument');
    process.exit(1);
  }

  if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY === 'your_api_key_here') {
    console.error('Please set a valid GOOGLE_MAPS_API_KEY in your .env file');
    process.exit(1);
  }

  try {
    const mapsData = await parseGoogleMapsUrl(url);
    const location = createLocation(mapsData);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save to file
    const outputPath = path.join(outputDir, `${location.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(location, null, 2));

    console.log('Location data saved to:', outputPath);
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