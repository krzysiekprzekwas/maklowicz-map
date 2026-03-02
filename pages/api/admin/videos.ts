import type { NextApiRequest, NextApiResponse } from 'next';
import type { Video } from '../../../types/Location';
import { parseYouTubeVideo } from '../../../src/lib/adminParsers';
import { readLocationData, toVideoSummary, writeLocationData } from '../../../src/lib/adminDataStore';

function isAdminEnabled() {
  return process.env.NODE_ENV !== 'production';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminEnabled()) {
    return res.status(403).json({ error: 'Admin studio is disabled in production.' });
  }

  if (req.method === 'GET') {
    const data = await readLocationData();
    return res.status(200).json({ videos: data.videos.map(toVideoSummary) });
  }

  if (req.method === 'POST') {
    const body = req.body as { action?: 'parse' | 'upsert'; videoUrl?: string; video?: Video };
    if (body.action === 'parse') {
      if (!body.videoUrl?.trim()) {
        return res.status(400).json({ error: 'videoUrl is required.' });
      }
      try {
        const parsed = await parseYouTubeVideo(body.videoUrl.trim());
        return res.status(200).json({ video: parsed });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown parser error.';
        return res.status(400).json({ error: message });
      }
    }

    if (body.action === 'upsert') {
      if (!body.video?.videoId || !body.video.videoUrl || !body.video.title) {
        return res.status(400).json({ error: 'video with videoId, videoUrl and title is required.' });
      }

      const data = await readLocationData();
      const existingIndex = data.videos.findIndex((video) => video.videoId === body.video?.videoId);

      if (existingIndex >= 0) {
        const current = data.videos[existingIndex];
        data.videos[existingIndex] = {
          ...current,
          ...body.video,
          locations: current.locations,
        };
      } else {
        data.videos.unshift({
          ...body.video,
          locations: body.video.locations ?? [],
        });
      }

      await writeLocationData(data);
      const stored = data.videos.find((video) => video.videoId === body.video?.videoId)!;
      return res.status(200).json({ video: toVideoSummary(stored) });
    }

    return res.status(400).json({ error: 'Unsupported action. Use action=parse or action=upsert.' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed.' });
}
