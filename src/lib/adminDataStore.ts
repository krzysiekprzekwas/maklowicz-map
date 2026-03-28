import { promises as fs } from 'fs';
import path from 'path';
import type { Location, LocationData, LocationType, Video } from '../../types/Location';
import { toSlug } from './slug';

const DATA_PATH = path.join(process.cwd(), 'data', 'locations.json');
const BACKUP_PATH = path.join(process.cwd(), 'data', 'locations.backup.json');

export const ALLOWED_LOCATION_TYPES: LocationType[] = [
  'restaurant',
  'cafe',
  'nature',
  'art_culture',
  'museum',
  'shopping',
  'hotel',
  'tourist_attraction',
];

export type LocationRow = Location & {
  videoId: string;
  videoTitle: string;
  videoDate: string;
  locationIndex: number;
};

export async function readLocationData(): Promise<LocationData> {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw) as LocationData;
}

export async function writeLocationData(data: LocationData): Promise<void> {
  const previous = await fs.readFile(DATA_PATH, 'utf8');
  await fs.writeFile(BACKUP_PATH, previous, 'utf8');
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export function flattenLocations(data: LocationData): LocationRow[] {
  return data.videos.flatMap((video) =>
    video.locations.map((location, index) => ({
      ...location,
      videoId: video.videoId,
      videoTitle: video.filterTitle || video.title,
      videoDate: video.date,
      locationIndex: index,
    }))
  );
}

export function generateSlugId(name: string): string {
  return toSlug(name);
}

export function ensureUniqueLocationId(baseId: string, takenIds: Set<string>): string {
  if (!takenIds.has(baseId)) return baseId;
  let i = 2;
  while (takenIds.has(`${baseId}-${i}`)) {
    i += 1;
  }
  return `${baseId}-${i}`;
}

export function sanitizeLocationInput(input: Partial<Location>): Location {
  const name = `${input.name ?? ''}`.trim();
  const type = `${input.type ?? 'tourist_attraction'}` as LocationType;

  return {
    id: `${input.id ?? ''}`.trim(),
    name,
    description: `${input.description ?? ''}`.trim(),
    latitude: Number(input.latitude ?? 0),
    longitude: Number(input.longitude ?? 0),
    address: `${input.address ?? ''}`.trim(),
    country: `${input.country ?? ''}`.trim(),
    type: ALLOWED_LOCATION_TYPES.includes(type) ? type : 'tourist_attraction',
    websiteUrl: `${input.websiteUrl ?? ''}`.trim(),
    GoogleMapsLink: `${input.GoogleMapsLink ?? ''}`.trim(),
    image: `${input.image ?? ''}`.trim(),
    ...(input.summary !== undefined ? { summary: `${input.summary}`.trim() } : {}),
  };
}

export function validateLocation(location: Location): string[] {
  const errors: string[] = [];

  if (!location.name) errors.push('Missing location name.');
  if (!location.address) errors.push('Missing address.');
  if (!location.country) errors.push('Missing country.');
  if (!Number.isFinite(location.latitude)) errors.push('Invalid latitude.');
  if (!Number.isFinite(location.longitude)) errors.push('Invalid longitude.');
  if (!ALLOWED_LOCATION_TYPES.includes(location.type)) errors.push(`Unsupported location type: ${location.type}.`);

  return errors;
}

export function toVideoSummary(video: Video) {
  return {
    videoId: video.videoId,
    title: video.title,
    filterTitle: video.filterTitle,
    date: video.date,
    show: video.show,
    locationCount: video.locations.length,
  };
}
