import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { Location, LocationType, Video } from '../../types/Location';

const LocationPinMap = dynamic(() => import('../../components/admin/LocationPinMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: 350 }}
      className="flex items-center justify-center border border-secondary-border rounded bg-secondary text-sm text-gray-500"
    >
      Loading map...
    </div>
  ),
});

type VideoSummary = {
  videoId: string;
  title: string;
  filterTitle: string;
  date: string;
  show: string;
  locationCount: number;
};

type LocationRow = Location & {
  videoId: string;
  videoTitle: string;
  videoDate: string;
  locationIndex: number;
};

type LocationsResponse = {
  locations: LocationRow[];
  countries: string[];
  types: string[];
  stats: {
    total: number;
    missingImage: number;
  };
};

const LOCATION_TYPES: LocationType[] = [
  'restaurant',
  'cafe',
  'nature',
  'art_culture',
  'museum',
  'shopping',
  'hotel',
  'tourist_attraction',
  'attraction',
];

const emptyLocation: Partial<Location> = {
  id: '',
  name: '',
  description: '',
  latitude: 0,
  longitude: 0,
  address: '',
  country: '',
  type: 'tourist_attraction',
  websiteUrl: '',
  GoogleMapsLink: '',
  image: '',
};

export default function AdminStudioPage() {
  const [videos, setVideos] = React.useState<VideoSummary[]>([]);
  const [locations, setLocations] = React.useState<LocationRow[]>([]);
  const [countries, setCountries] = React.useState<string[]>([]);
  const [types, setTypes] = React.useState<string[]>([]);
  const [stats, setStats] = React.useState<LocationsResponse['stats']>({
    total: 0,
    missingImage: 0,
  });

  const [activeTab, setActiveTab] = React.useState<'ingest' | 'browse'>('ingest');
  const [status, setStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const [query, setQuery] = React.useState('');
  const [onlyMissingImage, setOnlyMissingImage] = React.useState(false);
  const [countryFilter, setCountryFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [imageUploadStatus, setImageUploadStatus] = React.useState('');

  const [selectedLocationKey, setSelectedLocationKey] = React.useState('');
  const [locationDraft, setLocationDraft] = React.useState<Partial<Location>>(emptyLocation);

  const [videoUrl, setVideoUrl] = React.useState('');
  const [parsedVideo, setParsedVideo] = React.useState<Video | null>(null);
  const [targetVideoId, setTargetVideoId] = React.useState('');
  const [mapsUrl, setMapsUrl] = React.useState('');
  const [ingestDraft, setIngestDraft] = React.useState<Partial<Location>>(emptyLocation);

  const toLocationKey = React.useCallback((location: LocationRow) => {
    return `${location.videoId}::${location.locationIndex}`;
  }, []);

  const selectedLocation = React.useMemo(
    () => locations.find((location) => toLocationKey(location) === selectedLocationKey) || null,
    [locations, selectedLocationKey, toLocationKey]
  );

  const loadVideos = React.useCallback(async () => {
    const res = await fetch('/api/admin/videos');
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const ordered = (data.videos as VideoSummary[]).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    setVideos(ordered);
    if (!targetVideoId && ordered.length > 0) {
      setTargetVideoId(ordered[0].videoId);
    }
  }, [targetVideoId]);

  const loadLocations = React.useCallback(async () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (onlyMissingImage) params.set('missingImage', '1');
    if (countryFilter) params.set('country', countryFilter);
    if (typeFilter) params.set('type', typeFilter);

    const res = await fetch(`/api/admin/locations?${params.toString()}`);
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as LocationsResponse;
    setLocations(data.locations);
    setCountries(data.countries);
    setTypes(data.types);
    setStats(data.stats);
  }, [query, onlyMissingImage, countryFilter, typeFilter]);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([loadVideos(), loadLocations()])
      .catch((e) => setError(e instanceof Error ? e.message : 'Unexpected load error'))
      .finally(() => setLoading(false));
  }, [loadVideos, loadLocations]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadLocations().catch((e) => setError(e instanceof Error ? e.message : 'Could not reload locations'));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [loadLocations]);

  React.useEffect(() => {
    if (!selectedLocation) return;
    setLocationDraft({
      id: selectedLocation.id,
      name: selectedLocation.name,
      description: selectedLocation.description,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: selectedLocation.address,
      country: selectedLocation.country,
      type: selectedLocation.type,
      websiteUrl: selectedLocation.websiteUrl || '',
      GoogleMapsLink: selectedLocation.GoogleMapsLink || '',
      image: selectedLocation.image || '',
    });
  }, [selectedLocation]);

  async function parseVideo() {
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse', videoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not parse video');
      setParsedVideo(data.video as Video);
      setStatus('Video parsed. Save it to locations.json if this is a new episode.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error');
    } finally {
      setLoading(false);
    }
  }

  async function saveParsedVideo() {
    if (!parsedVideo) return;
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upsert', video: parsedVideo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save video');
      setTargetVideoId(data.video.videoId);
      await loadVideos();
      setStatus('Video saved/updated successfully.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save video error');
    } finally {
      setLoading(false);
    }
  }

  async function parseMapsLocation() {
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/parse-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mapsUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not parse map location');
      setIngestDraft(data.location as Partial<Location>);
      setStatus('Location parsed. Review fields and save.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse location error');
    } finally {
      setLoading(false);
    }
  }

  async function addLocationToVideo() {
    if (!targetVideoId) {
      setError('Select target video first.');
      return;
    }
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: targetVideoId, location: ingestDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save location');
      setStatus(`Location saved with id: ${data.location.id}`);
      setIngestDraft({
        ...emptyLocation,
        country: ingestDraft.country,
      });
      setMapsUrl('');
      await Promise.all([loadLocations(), loadVideos()]);
      const row = locations.find((location) => location.id === data.location.id);
      if (row) setSelectedLocationKey(toLocationKey(row));
      setActiveTab('browse');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Add location error');
    } finally {
      setLoading(false);
    }
  }

  async function saveLocationEdits() {
    if (!selectedLocation) return;
    setError('');
    setStatus('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedLocation.id,
          videoId: selectedLocation.videoId,
          locationIndex: selectedLocation.locationIndex,
          patch: locationDraft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save changes');
      setStatus(`Saved ${data.location.id}.`);
      await loadLocations();
      setSelectedLocationKey(`${selectedLocation.videoId}::${selectedLocation.locationIndex}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Edit save error');
    } finally {
      setLoading(false);
    }
  }

  async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read file.'));
      reader.readAsDataURL(file);
    });
  }

  async function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not decode image.'));
      img.src = src;
    });
  }

  async function imageFileToNormalizedWebpDataUrl(
    file: File,
    maxEdge = 1600,
    quality = 0.8
  ): Promise<string> {
    const sourceDataUrl = await fileToDataUrl(file);
    const img = await loadImageElement(sourceDataUrl);

    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not initialize image processing context.');
    }
    ctx.drawImage(img, 0, 0, width, height);

    const webpDataUrl = canvas.toDataURL('image/webp', quality);
    if (webpDataUrl.startsWith('data:image/webp')) return webpDataUrl;

    const jpegDataUrl = canvas.toDataURL('image/jpeg', Math.min(0.86, quality + 0.06));
    if (jpegDataUrl.startsWith('data:image/jpeg')) return jpegDataUrl;

    const pngDataUrl = canvas.toDataURL('image/png');
    if (pngDataUrl.startsWith('data:image/png')) return pngDataUrl;

    throw new Error('Image conversion is not supported by this browser.');
  }

  async function uploadImageFromFile(
    file: File,
    draft: Partial<Location>,
    setDraft: React.Dispatch<React.SetStateAction<Partial<Location>>>
  ) {
    setError('');
    setImageUploadStatus('');
    setLoading(true);
    try {
      const dataUrl = await imageFileToNormalizedWebpDataUrl(file);
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          locationId: draft.id || '',
          locationName: draft.name || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image upload failed');
      setDraft((prev) => ({ ...prev, image: data.imagePath }));
      setImageUploadStatus(`Image uploaded and normalized: ${data.imagePath}`);
      setStatus('Image attached to location draft.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image upload error');
    } finally {
      setLoading(false);
    }
  }

  async function uploadImageFromUrl(
    imageUrl: string,
    draft: Partial<Location>,
    setDraft: React.Dispatch<React.SetStateAction<Partial<Location>>>
  ) {
    setError('');
    setImageUploadStatus('');
    setLoading(true);
    try {
      // Try client-side fetch first to normalize to WebP before upload.
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Image fetch failed.');
        const blob = await response.blob();
        const file = new File([blob], 'image', { type: blob.type || 'image/jpeg' });
        await uploadImageFromFile(file, draft, setDraft);
        return;
      } catch {
        // Fall back to server import when browser fetch is blocked (e.g. CORS).
      }

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          locationId: draft.id || '',
          locationName: draft.name || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image import failed');
      setDraft((prev) => ({ ...prev, image: data.imagePath }));
      setImageUploadStatus(`Image imported: ${data.imagePath}`);
      setStatus('Image attached to location draft. Note: URL fallback may keep original format.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image import error');
    } finally {
      setLoading(false);
    }
  }

  function extractImageUrlFromClipboard(event: React.ClipboardEvent<HTMLDivElement>): string | null {
    const uriList = event.clipboardData.getData('text/uri-list').trim();
    if (uriList) return uriList;

    const plain = event.clipboardData.getData('text/plain').trim();
    if (plain && /^https?:\/\//i.test(plain)) return plain;

    const html = event.clipboardData.getData('text/html');
    if (html) {
      const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (match?.[1] && /^https?:\/\//i.test(match[1])) return match[1];
    }

    return null;
  }

  async function handleImagePaste(
    event: React.ClipboardEvent<HTMLDivElement>,
    draft: Partial<Location>,
    setDraft: React.Dispatch<React.SetStateAction<Partial<Location>>>
  ) {
    const items = event.clipboardData?.items;
    if (items) {
      const imageItem = Array.from(items).find((item) => item.type.startsWith('image/'));
      if (imageItem) {
        event.preventDefault();
        const file = imageItem.getAsFile();
        if (file) {
          await uploadImageFromFile(file, draft, setDraft);
          return;
        }
      }
    }

    const imageUrl = extractImageUrlFromClipboard(event);
    if (!imageUrl) return;
    event.preventDefault();
    await uploadImageFromUrl(imageUrl, draft, setDraft);
  }

  function renderLocationForm(
    draft: Partial<Location>,
    setDraft: React.Dispatch<React.SetStateAction<Partial<Location>>>
  ) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm text-primary">
          ID
          <input
            value={draft.id || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, id: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary">
          Type
          <select
            value={draft.type || 'tourist_attraction'}
            onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value as LocationType }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          >
            {LOCATION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-primary md:col-span-2">
          Name
          <input
            value={draft.name || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary md:col-span-2">
          Address
          <input
            value={draft.address || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, address: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary">
          Country
          <input
            value={draft.country || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, country: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary">
          Website URL
          <input
            value={draft.websiteUrl || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, websiteUrl: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary">
          Latitude
          <input
            type="number"
            step="0.000001"
            value={Number(draft.latitude ?? 0)}
            onChange={(e) => setDraft((prev) => ({ ...prev, latitude: Number(e.target.value) }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary">
          Longitude
          <input
            type="number"
            step="0.000001"
            value={Number(draft.longitude ?? 0)}
            onChange={(e) => setDraft((prev) => ({ ...prev, longitude: Number(e.target.value) }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <div className="md:col-span-2">
          <p className="text-sm text-primary mb-1">Pin location (drag to correct)</p>
          <LocationPinMap
            latitude={Number(draft.latitude ?? 0)}
            longitude={Number(draft.longitude ?? 0)}
            onChange={(lat, lng) => setDraft((prev) => ({ ...prev, latitude: lat, longitude: lng }))}
          />
        </div>
        <label className="text-sm text-primary md:col-span-2">
          Google Maps Link
          <input
            value={draft.GoogleMapsLink || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, GoogleMapsLink: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm text-primary md:col-span-2">
          Image
          <input
            value={draft.image || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer rounded border border-secondary-border bg-white px-3 py-1.5 text-xs text-primary hover:bg-secondary">
              Select image from disk
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const input = e.target as HTMLInputElement;
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await uploadImageFromFile(file, draft, setDraft);
                  input.value = '';
                }}
              />
            </label>
            {draft.image && (
              <a
                href={draft.image}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline text-primary"
              >
                Open image
              </a>
            )}
          </div>
          <div
            onPaste={(event) => {
              void handleImagePaste(event, draft, setDraft);
            }}
            className="mt-2 rounded border border-dashed border-secondary-border bg-secondary px-3 py-2 text-xs text-gray-600"
          >
            Paste copied image here (Cmd/Ctrl+V). If clipboard contains an image URL/source, it will also be imported and saved locally.
          </div>
        </label>
        <label className="text-sm text-primary md:col-span-2">
          Description
          <textarea
            value={draft.description || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            rows={5}
            className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
          />
        </label>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-secondary overflow-y-auto">
      <Head>
        <title>Admin Studio | Śladami Roberta Makłowicza</title>
      </Head>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold text-primary">Admin Studio</h1>
        <p className="text-sm text-primary-hover mt-2">
          One-by-one ingest + quick editor for all locations. Data is written directly to data/locations.json.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-secondary-border bg-white p-4">
            <p className="text-xs uppercase text-gray-500">All locations</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-secondary-border bg-white p-4">
            <p className="text-xs uppercase text-gray-500">Missing image</p>
            <p className="text-2xl font-bold text-primary">{stats.missingImage}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'ingest' ? 'bg-primary text-secondary' : 'bg-white text-primary border border-secondary-border'}`}
            onClick={() => setActiveTab('ingest')}
          >
            Ingest
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'browse' ? 'bg-primary text-secondary' : 'bg-white text-primary border border-secondary-border'}`}
            onClick={() => setActiveTab('browse')}
          >
            Browse & Edit
          </button>
        </div>

        {status && <div className="mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{status}</div>}
        {imageUploadStatus && <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">{imageUploadStatus}</div>}
        {error && <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}
        {loading && <div className="mt-4 text-sm text-primary">Working...</div>}

        {activeTab === 'ingest' && (
          <section className="mt-6 space-y-4">
            <div className="rounded-lg border border-secondary-border bg-white p-4">
              <h2 className="text-lg font-semibold text-primary">1) Select or Add Video</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="md:col-span-3 rounded border border-secondary-border px-3 py-2 text-sm"
                />
                <button onClick={parseVideo} className="rounded bg-primary px-3 py-2 text-sm text-secondary">
                  Parse Video
                </button>
              </div>

              {parsedVideo && (
                <div className="mt-3 rounded border border-secondary-border p-3 bg-secondary">
                  <p className="text-sm text-primary"><strong>Parsed:</strong> {parsedVideo.filterTitle}</p>
                  <p className="text-xs text-gray-600 mt-1">{parsedVideo.videoId} | {parsedVideo.date}</p>
                  <button onClick={saveParsedVideo} className="mt-3 rounded bg-primary px-3 py-2 text-sm text-secondary">
                    Save Video to Data
                  </button>
                </div>
              )}

              <label className="block text-sm text-primary mt-4">
                Target Video
                <select
                  value={targetVideoId}
                  onChange={(e) => setTargetVideoId(e.target.value)}
                  className="mt-1 w-full rounded border border-secondary-border px-3 py-2 text-sm"
                >
                  <option value="">-- select video --</option>
                  {videos.map((video) => (
                    <option key={video.videoId} value={video.videoId}>
                      {video.filterTitle || video.title} ({video.locationCount})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-lg border border-secondary-border bg-white p-4">
              <h2 className="text-lg font-semibold text-primary">2) Add Next Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <input
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="Google Maps URL"
                  className="md:col-span-3 rounded border border-secondary-border px-3 py-2 text-sm"
                />
                <button onClick={parseMapsLocation} className="rounded bg-primary px-3 py-2 text-sm text-secondary">
                  Parse Location
                </button>
              </div>

              <div className="mt-4">{renderLocationForm(ingestDraft, setIngestDraft)}</div>

              <button onClick={addLocationToVideo} className="mt-4 rounded bg-primary px-4 py-2 text-sm text-secondary">
                Save Location
              </button>
            </div>
          </section>
        )}

        {activeTab === 'browse' && (
          <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-secondary-border bg-white p-4">
              <h2 className="text-lg font-semibold text-primary">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name/address/country/video..."
                  className="md:col-span-2 rounded border border-secondary-border px-3 py-2 text-sm"
                />
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded border border-secondary-border px-3 py-2 text-sm"
                >
                  <option value="">All countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded border border-secondary-border px-3 py-2 text-sm"
                >
                  <option value="">All types</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    checked={onlyMissingImage}
                    onChange={(e) => setOnlyMissingImage(e.target.checked)}
                  />
                  Missing image
                </label>
              </div>

              <div className="mt-4 max-h-[60vh] overflow-auto border border-secondary-border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Location</th>
                      <th className="px-3 py-2 text-left">Country</th>
                      <th className="px-3 py-2 text-left">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locations.map((location) => (
                      <tr
                        key={`${location.videoId}:${location.id}:${location.locationIndex}`}
                        className={`border-t border-secondary-border cursor-pointer ${selectedLocationKey === toLocationKey(location) ? 'bg-secondary' : 'bg-white hover:bg-secondary'}`}
                        onClick={() => setSelectedLocationKey(toLocationKey(location))}
                      >
                        <td className="px-3 py-2">
                          <div className="font-medium text-primary">{location.name}</div>
                          <div className="text-xs text-gray-500">{location.videoTitle}</div>
                        </td>
                        <td className="px-3 py-2">{location.country}</td>
                        <td className="px-3 py-2">{location.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-secondary-border bg-white p-4">
              <h2 className="text-lg font-semibold text-primary">Edit Location</h2>
              {!selectedLocation && <p className="text-sm text-gray-500 mt-3">Select a location from the list.</p>}
              {selectedLocation && (
                <>
                  <p className="text-xs text-gray-500 mt-2">
                    Video: {selectedLocation.videoTitle} ({selectedLocation.videoId})
                  </p>
                  <div className="mt-3">{renderLocationForm(locationDraft, setLocationDraft)}</div>
                  <button
                    onClick={saveLocationEdits}
                    className="mt-4 rounded bg-primary px-4 py-2 text-sm text-secondary"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
