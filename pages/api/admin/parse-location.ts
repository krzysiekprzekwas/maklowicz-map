import type { NextApiRequest, NextApiResponse } from 'next';
import { parseGoogleMapsUrl } from '../../../src/lib/adminParsers';

function isAdminEnabled() {
  return process.env.NODE_ENV !== 'production';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isAdminEnabled()) {
    return res.status(403).json({ error: 'Admin studio is disabled in production.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { url } = req.body as { url?: string };
  if (!url?.trim()) {
    return res.status(400).json({ error: 'Google Maps URL is required.' });
  }

  try {
    const location = await parseGoogleMapsUrl(url.trim());
    return res.status(200).json({ location });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parser error.';
    return res.status(400).json({ error: message });
  }
}
