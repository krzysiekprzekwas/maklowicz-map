import type { NextApiRequest, NextApiResponse } from 'next';
import type { Location } from '../../../types/Location';
import {
  ensureUniqueLocationId,
  flattenLocations,
  generateSlugId,
  readLocationData,
  sanitizeLocationInput,
  validateLocation,
  writeLocationData,
} from '../../../src/lib/adminDataStore';

function isAdminEnabled() {
  return process.env.NODE_ENV !== 'production';
}

function isMissing(value?: string) {
  return !value || !value.trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminEnabled()) {
    return res.status(403).json({ error: 'Admin studio is disabled in production.' });
  }

  if (req.method === 'GET') {
    const data = await readLocationData();
    const q = `${req.query.q ?? ''}`.trim().toLowerCase();
    const missingImage = req.query.missingImage === '1';
    const country = `${req.query.country ?? ''}`.trim();
    const type = `${req.query.type ?? ''}`.trim();

    let rows = flattenLocations(data);
    if (q) {
      rows = rows.filter((row) =>
        [row.name, row.address, row.country, row.videoTitle].some((field) => field.toLowerCase().includes(q))
      );
    }
    if (missingImage) rows = rows.filter((row) => isMissing(row.image));
    if (country) rows = rows.filter((row) => row.country === country);
    if (type) rows = rows.filter((row) => row.type === type);

    const countries = Array.from(new Set(flattenLocations(data).map((row) => row.country))).sort((a, b) =>
      a.localeCompare(b)
    );
    const types = Array.from(new Set(flattenLocations(data).map((row) => row.type))).sort((a, b) =>
      a.localeCompare(b)
    );
    const stats = {
      total: flattenLocations(data).length,
      missingImage: flattenLocations(data).filter((row) => isMissing(row.image)).length,
    };

    return res.status(200).json({ locations: rows, countries, types, stats });
  }

  if (req.method === 'PUT') {
    const { id, videoId, locationIndex, patch } = req.body as {
      id?: string;
      videoId?: string;
      locationIndex?: number;
      patch?: Partial<Location>;
    };
    if (!patch) {
      return res.status(400).json({ error: 'patch is required.' });
    }

    const data = await readLocationData();
    const allRows = flattenLocations(data);

    let video = null as (typeof data.videos)[number] | null;
    let index = -1;

    if (videoId && Number.isInteger(locationIndex)) {
      video = data.videos.find((item) => item.videoId === videoId) || null;
      if (!video) {
        return res.status(404).json({ error: `Video ${videoId} not found.` });
      }
      if ((locationIndex as number) < 0 || (locationIndex as number) >= video.locations.length) {
        return res.status(404).json({ error: `Location index ${locationIndex} not found in video ${videoId}.` });
      }
      index = locationIndex as number;
    } else {
      if (!id?.trim()) {
        return res.status(400).json({ error: 'id is required when videoId/locationIndex are not provided.' });
      }
      const row = allRows.find((item) => item.id === id);
      if (!row) {
        return res.status(404).json({ error: `Location ${id} not found.` });
      }
      video = data.videos.find((item) => item.videoId === row.videoId)!;
      index = video.locations.findIndex((item) => item.id === id);
    }

    const previousId = video.locations[index].id;
    const merged = sanitizeLocationInput({
      ...video.locations[index],
      ...patch,
    });

    const nextId = merged.id || generateSlugId(merged.name);
    const takenIds = new Set(allRows.filter((item) => item.id !== previousId).map((item) => item.id));
    merged.id = ensureUniqueLocationId(nextId, takenIds);

    const errors = validateLocation(merged);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    video.locations[index] = merged;
    await writeLocationData(data);

    return res.status(200).json({ location: merged, videoId: video.videoId });
  }

  if (req.method === 'POST') {
    const { videoId, location } = req.body as { videoId?: string; location?: Partial<Location> };
    if (!videoId?.trim() || !location) {
      return res.status(400).json({ error: 'videoId and location are required.' });
    }

    const data = await readLocationData();
    const video = data.videos.find((item) => item.videoId === videoId);
    if (!video) {
      return res.status(404).json({ error: `Video ${videoId} not found.` });
    }

    const prepared = sanitizeLocationInput(location);
    const proposedId = prepared.id || generateSlugId(prepared.name);
    const takenIds = new Set(flattenLocations(data).map((item) => item.id));
    prepared.id = ensureUniqueLocationId(proposedId, takenIds);

    const errors = validateLocation(prepared);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(' ') });
    }

    video.locations.push(prepared);
    await writeLocationData(data);

    return res.status(200).json({ location: prepared, videoId: video.videoId });
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).json({ error: 'Method not allowed.' });
}
