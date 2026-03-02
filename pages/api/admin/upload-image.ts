import type { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import { generateSlugId } from '../../../src/lib/adminDataStore';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

function isAdminEnabled() {
  return process.env.NODE_ENV !== 'production';
}

function extensionFromMime(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/avif') return 'avif';
  if (mimeType === 'image/gif') return 'gif';
  return 'jpg';
}

function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data format. Expected base64 data URL.');
  }
  const mimeType = match[1];
  if (!mimeType.startsWith('image/')) {
    throw new Error('Only image uploads are supported.');
  }
  return {
    mimeType,
    buffer: Buffer.from(match[2], 'base64'),
  };
}

async function fetchImageFromUrl(imageUrl: string): Promise<{ mimeType: string; buffer: Buffer }> {
  const response = await axios.get<ArrayBuffer>(imageUrl, {
    responseType: 'arraybuffer',
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });
  const contentType = `${response.headers['content-type'] || ''}`.split(';')[0].trim();
  if (!contentType.startsWith('image/')) {
    throw new Error('Provided URL does not return an image.');
  }
  return {
    mimeType: contentType,
    buffer: Buffer.from(response.data),
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminEnabled()) {
    return res.status(403).json({ error: 'Admin studio is disabled in production.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { dataUrl, imageUrl, locationId, locationName } = req.body as {
    dataUrl?: string;
    imageUrl?: string;
    locationId?: string;
    locationName?: string;
  };

  if (!dataUrl?.trim() && !imageUrl?.trim()) {
    return res.status(400).json({ error: 'dataUrl or imageUrl is required.' });
  }

  try {
    const source = dataUrl?.trim()
      ? await Promise.resolve(parseDataUrl(dataUrl.trim()))
      : await fetchImageFromUrl(imageUrl!.trim());
    const { mimeType, buffer } = source;
    const ext = extensionFromMime(mimeType);
    const baseName = generateSlugId((locationId || locationName || 'location-image').trim()) || 'location-image';
    const fileName = `${baseName}.${ext}`;
    const relativePath = `/images/${fileName}`;
    const absolutePath = path.join(process.cwd(), 'public', 'images', fileName);

    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, buffer);

    return res.status(200).json({ imagePath: relativePath, fileName });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown upload error.';
    return res.status(400).json({ error: message });
  }
}
