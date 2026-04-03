import React, { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import html2canvas from 'html2canvas';
import locationData from '../../data/locations.json';
import type { LocationData, Location } from '../../types/Location';

const typedData = locationData as LocationData;

const everyLocation = typedData.videos.flatMap((v) => v.locations);
const totalLocationCount = everyLocation.length;
const totalCountryCount = new Set(everyLocation.map((l) => l.country)).size;
const totalEpisodeCount = typedData.videos.filter((v) => v.locations?.length > 0).length;
const countryLocationCounts: Record<string, number> = {};
everyLocation.forEach((l) => { countryLocationCounts[l.country] = (countryLocationCounts[l.country] || 0) + 1; });

const allLocations = typedData.videos
  .flatMap((v) => v.locations.map((l) => ({ ...l, videoTitle: v.filterTitle })))
  .filter((l) => !!l.image);

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restauracja',
  cafe: 'Kawiarnia',
  nature: 'Przyroda',
  art_culture: 'Sztuka i kultura',
  museum: 'Muzeum',
  shopping: 'Zakupy',
  hotel: 'Hotel',
  tourist_attraction: 'Atrakcja turystyczna',
};

const ICON_PATHS: Record<string, string> = {
  restaurant: '/icons/restaurant.svg',
  cafe: '/icons/cafe.svg',
  nature: '/icons/nature.svg',
  art_culture: '/icons/art_and_culture.svg',
  museum: '/icons/museum.svg',
  shopping: '/icons/shopping.svg',
  hotel: '/icons/hotel.svg',
  tourist_attraction: '/icons/tourist-attraction.svg',
};

type Format = 'square' | 'portrait' | 'story';

const FORMAT_DIMS: Record<Format, { w: number; h: number; label: string }> = {
  square:   { w: 1080, h: 1080, label: '1:1' },
  portrait: { w: 1080, h: 1350, label: '4:5' },
  story:    { w: 1080, h: 1920, label: '9:16' },
};

type VariantId =
  | 'bold' | 'split' | 'polaroid' | 'frame' | 'magazine' | 'minimal'
  | 'overlay' | 'card' | 'duo' | 'stamp' | 'cinematic' | 'quote'
  | 'mapPin' | 'mapCard' | 'mapSplit' | 'mapCircle'
  | 'infoClean' | 'infoDark' | 'infoQuote' | 'infoSplit'
  | 'ctaClean' | 'ctaCountry' | 'ctaGlobal' | 'ctaStats';

const VARIANTS: { id: VariantId; name: string; group?: string }[] = [
  { id: 'bold', name: 'Bold' },
  { id: 'split', name: 'Split' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'frame', name: 'Frame' },
  { id: 'magazine', name: 'Magazine' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'overlay', name: 'Overlay' },
  { id: 'card', name: 'Card' },
  { id: 'duo', name: 'Duo' },
  { id: 'stamp', name: 'Stamp' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'quote', name: 'Quote' },
  { id: 'mapPin', name: 'Map Pin', group: 'map' },
  { id: 'mapCard', name: 'Map Card', group: 'map' },
  { id: 'mapSplit', name: 'Map Split', group: 'map' },
  { id: 'mapCircle', name: 'Map Circle', group: 'map' },
  { id: 'infoClean', name: 'Info Clean', group: 'info' },
  { id: 'infoDark', name: 'Info Dark', group: 'info' },
  { id: 'infoQuote', name: 'Info Quote', group: 'info' },
  { id: 'infoSplit', name: 'Info Split', group: 'info' },
  { id: 'ctaClean', name: 'CTA Clean', group: 'cta' },
  { id: 'ctaCountry', name: 'CTA Country', group: 'cta' },
  { id: 'ctaGlobal', name: 'CTA Global', group: 'cta' },
  { id: 'ctaStats', name: 'CTA Stats', group: 'cta' },
];

const ACCENT_COLORS = ['#C2FF4E', '#0016DE', '#FF4C19', '#FF87CD'];

type LocationWithVideo = Location & { videoTitle: string };

interface TP {
  location: LocationWithVideo;
  format: Format;
  accent: string;
  mapZoom?: number;
  nearbyLocations?: LocationWithVideo[];
}

/** Resolve canvas dimensions */
function dims(format: Format) {
  return FORMAT_DIMS[format];
}

/* ------------------------------------------------------------------ */
/*  SHARED BRAND ELEMENTS                                              */
/* ------------------------------------------------------------------ */

function Pin({ color, dotColor, size = 48 }: { color: string; dotColor: string; size?: number }) {
  const r = size / 2;
  const triH = size * 0.2;
  return (
    <svg width={size} height={size + triH} viewBox={`0 0 ${size} ${size + triH}`} fill="none">
      <path d={`M${r} ${size + triH}L${size * 0.76} ${size * 0.88}H${size * 0.22}L${r} ${size + triH}Z`} fill={color} />
      <rect width={size} height={size} rx={r} fill={color} />
      <circle cx={r} cy={r} r={size * 0.18} fill={dotColor} />
    </svg>
  );
}

function PinRow({ count = 8, size = 38, gap = 24, style }: { count?: number; size?: number; gap?: number; style?: React.CSSProperties }) {
  const palette: [string, string][] = [
    ['#FF4C19', '#C2FF4E'],
    ['#fff', '#FF87CD'],
    ['#FF87CD', '#0016DE'],
    ['#0016DE', '#fff'],
  ];
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end', ...style }}>
      {Array.from({ length: count }).map((_, i) => {
        const [c, d] = palette[i % palette.length];
        return <Pin key={i} color={c} dotColor={d} size={size} />;
      })}
    </div>
  );
}

function TypeBadge({ type, badgeColor = '#C2FF4E', size = 64 }: { type: string; badgeColor?: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: badgeColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <img src={ICON_PATHS[type] || ICON_PATHS.tourist_attraction} alt="" style={{ width: size * 0.55, height: size * 0.55 }} />
    </div>
  );
}

function BlobPink({ size = 280, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size * 1.1} viewBox="-155 -30 271 298" fill="none" style={style}>
      <path
        opacity="0.4"
        d="M116 105.455C116 30.6451 55.3346 -30 -19.5 -30C-94.3346 -30 -155 30.6451 -155 105.455C-155 155.32 -130.406 193.753 -90.6375 222.406C-69.656 237.523 -19.5 268 -19.5 268C-19.5 268 22.357 241.594 48.9065 222.406C84.2147 196.886 116 155.32 116 105.455Z"
        fill="#FF87CD"
      />
      <circle cx="-19.2771" cy="107.723" r="45.7229" fill="#0016DE" />
    </svg>
  );
}

/** Scattered pins — decorative cluster of 2-3 pins at different angles/sizes */
function PinScatter({ size = 48, style }: { size?: number; style?: React.CSSProperties }) {
  const palette: [string, string][] = [
    ['#FF4C19', '#C2FF4E'],
    ['#FF87CD', '#0016DE'],
    ['#0016DE', '#fff'],
  ];
  return (
    <div style={{ position: 'relative', width: size * 2.5, height: size * 2.8, ...style }}>
      <div style={{ position: 'absolute', top: 0, left: '30%', transform: 'rotate(12deg)' }}>
        <Pin color={palette[0][0]} dotColor={palette[0][1]} size={size} />
      </div>
      <div style={{ position: 'absolute', top: '35%', left: 0, transform: 'rotate(-8deg)' }}>
        <Pin color={palette[1][0]} dotColor={palette[1][1]} size={size * 0.75} />
      </div>
      <div style={{ position: 'absolute', top: '20%', right: 0, transform: 'rotate(5deg)' }}>
        <Pin color={palette[2][0]} dotColor={palette[2][1]} size={size * 0.6} />
      </div>
    </div>
  );
}

function Logo({ width = 300, style }: { width?: number; style?: React.CSSProperties }) {
  return <img src="/main_mobile_header.svg" alt="" style={{ width, height: 'auto', ...style }} />;
}

/** Helpers for text color on accent */
function textOn(accent: string) { return accent === '#C2FF4E' ? '#00071A' : '#fff'; }
function subtleOn(accent: string) { return accent === '#C2FF4E' ? 'rgba(0,7,26,0.5)' : 'rgba(255,255,255,0.55)'; }
function pinDot(accent: string) { return accent === '#C2FF4E' ? '#00071A' : '#fff'; }

/* ------------------------------------------------------------------ */
/*  ORIGINAL 6 TEMPLATES                                               */
/* ------------------------------------------------------------------ */

function TemplateBold({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#00071A' }}>
      <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,7,26,0.95) 0%, rgba(0,7,26,0.55) 38%, transparent 62%)' }} />
      <div style={{ position: 'absolute', top: -40, right: -60, opacity: 0.35, pointerEvents: 'none' }}>
        <BlobPink size={tall ? 320 : 260} />
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: tall ? '80px 60px' : '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <TypeBadge type={location.type} badgeColor={accent} size={72} />
          <span style={{ fontSize: 30, fontWeight: 600, color: accent, fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
        </div>
        <div style={{ fontSize: tall ? 72 : 64, fontWeight: 700, color: '#fff', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1, marginBottom: 20 }}>{location.name}</div>
        <div style={{ fontSize: 30, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
          <Pin color={accent} dotColor={pinDot(accent)} size={32} />
          {location.country}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <PinRow count={6} size={30} gap={16} />
          <Logo width={200} style={{ opacity: 0.5 }} />
        </div>
      </div>
    </div>
  );
}

function TemplateSplit({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const vertical = format === 'story';
  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: vertical ? 'column' : 'row', overflow: 'hidden' }}>
      <div style={{ flex: vertical ? '0 0 55%' : '0 0 50%', position: 'relative', overflow: 'hidden' }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', bottom: vertical ? 'auto' : 32, top: vertical ? 32 : 'auto', left: 32 }}>
          <Pin color={accent} dotColor={pinDot(accent)} size={52} />
        </div>
      </div>
      <div style={{ flex: 1, background: '#F6F5F2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: vertical ? '48px 56px' : '44px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -50, pointerEvents: 'none' }}><BlobPink size={vertical ? 240 : 200} /></div>
        <div style={{ position: 'absolute', bottom: vertical ? 100 : 80, left: -10, pointerEvents: 'none', opacity: 0.35 }}><PinScatter size={vertical ? 44 : 36} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 }}>
          <TypeBadge type={location.type} badgeColor={accent} size={56} />
          <span style={{ fontSize: 24, fontWeight: 600, color: '#685F6D', fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
        </div>
        <div style={{ fontSize: vertical ? 52 : 48, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15, marginBottom: 20, position: 'relative', zIndex: 1 }}>{location.name}</div>
        <div style={{ fontSize: 26, color: '#685F6D', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, position: 'relative', zIndex: 1 }}>{location.country}</div>
        {location.summary && (
          <div style={{ fontSize: 24, color: '#B4ADB8', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginTop: 20, display: '-webkit-box', WebkitLineClamp: vertical ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', position: 'relative', zIndex: 1 }}>{location.summary}</div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <PinRow count={vertical ? 5 : 4} size={26} gap={12} />
          <Logo width={160} style={{ opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

function TemplatePolaroid({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const photoW = tall ? 860 : 840;
  const photoH = format === 'story' ? 1060 : format === 'portrait' ? 800 : 620;
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -60, right: -80, pointerEvents: 'none' }}><BlobPink size={tall ? 340 : 300} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 180 : 100, left: -10, pointerEvents: 'none', opacity: 0.4 }}><PinScatter size={tall ? 52 : 42} /></div>
      <div style={{ background: '#fff', padding: '28px 28px 90px 28px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)', transform: 'rotate(-1.5deg)', position: 'relative', zIndex: 1 }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: photoW, height: photoH, objectFit: 'cover', display: 'block' }} />
        <div style={{ marginTop: 16, fontFamily: 'Reenie Beanie, cursive', fontSize: 64, color: '#0016DE', textAlign: 'center', transform: 'rotate(1.5deg)', lineHeight: 1.1 }}>{location.name}</div>
      </div>
      <div style={{ marginTop: 36, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <TypeBadge type={location.type} badgeColor={accent} size={44} />
          <span style={{ fontSize: 28, color: '#685F6D', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{location.country} · {TYPE_LABELS[location.type]}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: tall ? 60 : 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 12 : 10} size={28} gap={20} />
      </div>
    </div>
  );
}

function TemplateFrame({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const borderW = 44;
  return (
    <div style={{ width: w, height: h, background: accent, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, margin: `${borderW}px ${borderW}px 0`, position: 'relative', overflow: 'hidden' }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,7,26,0.75), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 36, left: 44, right: 44, fontSize: tall ? 56 : 50, fontWeight: 700, color: '#fff', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
        <div style={{ position: 'absolute', top: 24, right: 24 }}><TypeBadge type={location.type} badgeColor={accent} size={64} /></div>
      </div>
      <div style={{ padding: `${tall ? 36 : 26}px ${borderW + 4}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pin color={textOn(accent)} dotColor={accent} size={34} />
          <span style={{ fontSize: 28, fontWeight: 600, color: textOn(accent), fontFamily: 'Work Sans, sans-serif' }}>{location.country}</span>
        </div>
        <Logo width={180} style={{ opacity: accent === '#C2FF4E' ? 0.35 : 0.6, filter: accent === '#C2FF4E' ? 'none' : 'brightness(10)' }} />
      </div>
    </div>
  );
}

function TemplateMagazine({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#00071A' }}>
      <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, opacity: 0.8 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,7,26,0.2)' }} />
      <div style={{ position: 'absolute', top: tall ? 64 : 48, left: tall ? 64 : 48, display: 'flex', alignItems: 'center', gap: 16, zIndex: 2 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={56} />
        <span style={{ background: 'rgba(0,7,26,0.55)', backdropFilter: 'blur(10px)', padding: '12px 24px', borderRadius: 100, fontSize: 24, color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{TYPE_LABELS[location.type]}</span>
      </div>
      <div style={{ position: 'absolute', left: -20, right: -20, top: tall ? '42%' : '36%', background: accent, padding: tall ? '48px 80px' : '40px 68px', transform: 'rotate(-2deg)', zIndex: 1 }}>
        <div style={{ fontSize: tall ? 68 : 58, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1, transform: 'rotate(2deg)' }}>{location.name}</div>
        <div style={{ fontSize: 28, color: textOn(accent), opacity: 0.65, fontFamily: 'Inter, sans-serif', marginTop: 14, transform: 'rotate(2deg)' }}>{location.country}</div>
      </div>
      <div style={{ position: 'absolute', bottom: tall ? 80 : 48, left: tall ? 64 : 48, right: tall ? 64 : 48, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <PinRow count={5} size={26} gap={14} />
          <Logo width={170} style={{ opacity: 0.45, filter: 'brightness(10)' }} />
        </div>
      </div>
    </div>
  );
}

function TemplateMinimal({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const photoSize = format === 'story' ? 580 : format === 'portrait' ? 540 : 500;
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tall ? '80px 72px' : '60px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -50, right: -70, pointerEvents: 'none' }}><BlobPink size={tall ? 300 : 250} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 140 : 80, left: -10, pointerEvents: 'none', opacity: 0.35 }}><PinScatter size={tall ? 46 : 38} /></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={52} />
        <span style={{ fontSize: 26, fontWeight: 600, color: '#685F6D', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: 3 }}>{TYPE_LABELS[location.type]}</span>
      </div>
      <div style={{ fontSize: tall ? 60 : 52, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.15, marginBottom: 40, position: 'relative', zIndex: 1 }}>{location.name}</div>
      <div style={{ width: photoSize, height: photoSize, borderRadius: 28, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <Pin color={accent} dotColor={pinDot(accent)} size={28} />
        <span style={{ fontSize: 28, color: '#685F6D', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{location.country}</span>
      </div>
      <div style={{ position: 'absolute', bottom: tall ? 60 : 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 12 : 10} size={26} gap={18} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NEW 6 TEMPLATES                                                    */
/* ------------------------------------------------------------------ */

/**
 * OVERLAY — Full photo, accent-tinted panel at bottom with summary
 */
function TemplateOverlay({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const panelH = tall ? '42%' : '40%';
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#00071A' }}>
      <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      {/* Accent-tinted bottom panel */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: panelH, background: accent, opacity: 0.88 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: panelH, padding: tall ? '48px 60px' : '40px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <TypeBadge type={location.type} badgeColor={textOn(accent)} size={56} />
          <div>
            <div style={{ fontSize: tall ? 52 : 46, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1 }}>{location.name}</div>
            <div style={{ fontSize: 24, color: subtleOn(accent), fontFamily: 'Inter, sans-serif', marginTop: 6 }}>{location.country}</div>
          </div>
        </div>
        {location.summary && (
          <div style={{ fontSize: 24, color: textOn(accent), opacity: 0.7, fontFamily: 'Inter, sans-serif', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: tall ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 20 }}>{location.summary}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <PinRow count={4} size={24} gap={12} />
          <Logo width={150} style={{ opacity: accent === '#C2FF4E' ? 0.3 : 0.55, filter: accent === '#C2FF4E' ? 'none' : 'brightness(10)' }} />
        </div>
      </div>
      {/* Top corner blob */}
      <div style={{ position: 'absolute', top: -40, left: -60, pointerEvents: 'none', opacity: 0.3 }}>
        <BlobPink size={tall ? 280 : 220} />
      </div>
    </div>
  );
}

/**
 * CARD — Dark bg, centered rounded card with photo + text, blobs behind
 */
function TemplateCard({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const cardW = w - (tall ? 100 : 120);
  const photoH = format === 'story' ? 900 : format === 'portrait' ? 680 : 540;
  return (
    <div style={{ width: w, height: h, background: '#00071A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: -60, right: -80, pointerEvents: 'none', opacity: 0.25 }}><BlobPink size={tall ? 400 : 320} /></div>
      <div style={{ position: 'absolute', bottom: 20, left: 20, pointerEvents: 'none', opacity: 0.15 }}><PinScatter size={tall ? 56 : 44} /></div>
      {/* Card */}
      <div style={{ width: cardW, background: '#F6F5F2', borderRadius: 32, overflow: 'hidden', boxShadow: '0 16px 64px rgba(0,0,0,0.3)', position: 'relative', zIndex: 1 }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: photoH, objectFit: 'cover', display: 'block' }} />
        <div style={{ padding: tall ? '40px 48px 44px' : '32px 40px 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <TypeBadge type={location.type} badgeColor={accent} size={52} />
            <div>
              <div style={{ fontSize: tall ? 44 : 40, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
              <div style={{ fontSize: 24, color: '#685F6D', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{location.country} · {TYPE_LABELS[location.type]}</div>
            </div>
          </div>
          {location.summary && (
            <div style={{ fontSize: 23, color: '#B4ADB8', fontFamily: 'Inter, sans-serif', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: tall ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{location.summary}</div>
          )}
        </div>
      </div>
      {/* Bottom branding */}
      <div style={{ position: 'absolute', bottom: tall ? 56 : 40, display: 'flex', alignItems: 'flex-end', gap: 24, zIndex: 1 }}>
        <PinRow count={6} size={24} gap={14} />
      </div>
    </div>
  );
}

/**
 * DUO — Top accent panel with name + type, bottom photo
 */
function TemplateDuo({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const topH = tall ? '38%' : '42%';
  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top accent panel */}
      <div style={{ flex: `0 0 ${topH}`, background: accent, padding: tall ? '64px 60px' : '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden' }}>
        {/* Blob decoration */}
        <div style={{ position: 'absolute', top: -40, right: -50, pointerEvents: 'none', opacity: 0.2 }}>
          <BlobPink size={tall ? 300 : 240} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <TypeBadge type={location.type} badgeColor={textOn(accent)} size={64} />
          <span style={{ fontSize: 26, fontWeight: 600, color: subtleOn(accent), fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
        </div>
        <div style={{ fontSize: tall ? 64 : 56, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1, position: 'relative', zIndex: 1 }}>{location.name}</div>
        <div style={{ fontSize: 28, color: subtleOn(accent), fontFamily: 'Inter, sans-serif', marginTop: 14, position: 'relative', zIndex: 1 }}>{location.country}</div>
      </div>
      {/* Bottom photo */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* Bottom-right logo */}
        <div style={{ position: 'absolute', bottom: 24, right: 32 }}>
          <Logo width={160} style={{ opacity: 0.5, filter: 'brightness(10)' }} />
        </div>
        {/* Pin row at bottom of photo */}
        <div style={{ position: 'absolute', bottom: 24, left: 32 }}>
          <PinRow count={4} size={24} gap={12} />
        </div>
      </div>
    </div>
  );
}

/**
 * STAMP — Cream bg, photo with thick accent border like a stamp, handwritten country
 */
function TemplateStamp({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const border = 20;
  const photoW = tall ? 840 : 820;
  const photoH = format === 'story' ? 1100 : format === 'portrait' ? 800 : 600;
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', bottom: -40, right: -60, pointerEvents: 'none', opacity: 0.5 }}><BlobPink size={tall ? 280 : 240} /></div>
      <div style={{ position: 'absolute', top: 20, left: 20, pointerEvents: 'none', opacity: 0.3 }}><PinScatter size={tall ? 46 : 38} /></div>
      {/* Photo with accent border */}
      <div style={{ border: `${border}px solid ${accent}`, borderRadius: 20, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: photoW, height: photoH, objectFit: 'cover', display: 'block' }} />
        {/* Type badge on photo */}
        <div style={{ position: 'absolute', top: 20, left: 20 }}><TypeBadge type={location.type} badgeColor={accent} size={60} /></div>
      </div>
      {/* Text below */}
      <div style={{ marginTop: 32, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: tall ? 52 : 46, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15, marginBottom: 12 }}>{location.name}</div>
        <div style={{ fontFamily: 'Reenie Beanie, cursive', fontSize: 48, color: '#0016DE' }}>{location.country}</div>
      </div>
      {/* Pin row */}
      <div style={{ position: 'absolute', bottom: tall ? 52 : 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 12 : 10} size={26} gap={18} />
      </div>
    </div>
  );
}

/**
 * CINEMATIC — Full photo with accent letterbox bars, name in bottom bar with summary
 */
function TemplateCinematic({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const barH = tall ? 280 : 220;
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#00071A' }}>
      <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: barH * 0.6, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TypeBadge type={location.type} badgeColor={textOn(accent)} size={48} />
          <span style={{ fontSize: 26, fontWeight: 600, color: textOn(accent), fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pin color={textOn(accent)} dotColor={accent} size={28} />
          <span style={{ fontSize: 24, color: subtleOn(accent), fontFamily: 'Inter, sans-serif' }}>{location.country}</span>
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, background: accent, padding: '36px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: tall ? 56 : 48, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1, marginBottom: 12 }}>{location.name}</div>
        {location.summary && (
          <div style={{ fontSize: 22, color: textOn(accent), opacity: 0.6, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{location.summary}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
          <PinRow count={4} size={22} gap={10} />
          <Logo width={140} style={{ opacity: accent === '#C2FF4E' ? 0.3 : 0.5, filter: accent === '#C2FF4E' ? 'none' : 'brightness(10)' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * QUOTE — Blurred photo bg, white centered card with name + summary + badge
 */
function TemplateQuote({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const cardW = tall ? 900 : 880;
  const cardPad = tall ? 56 : 48;
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: '#00071A' }}>
      {/* Blurred bg photo */}
      <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0, filter: 'blur(24px) brightness(0.5)', transform: 'scale(1.1)' }} />
      {/* Centered card */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 }}>
        {/* Photo thumbnail */}
        <div style={{ width: cardW - 80, height: format === 'story' ? 800 : format === 'portrait' ? 600 : 440, borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}>
          <img src={location.image!} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* Info card */}
        <div style={{ width: cardW, background: 'rgba(255,255,255,0.95)', borderRadius: 28, padding: `${cardPad}px`, position: 'relative' }}>
          {/* Accent top line */}
          <div style={{ position: 'absolute', top: 0, left: cardPad, right: cardPad, height: 5, background: accent, borderRadius: '0 0 3px 3px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <TypeBadge type={location.type} badgeColor={accent} size={56} />
            <div>
              <div style={{ fontSize: tall ? 46 : 40, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
              <div style={{ fontSize: 24, color: '#685F6D', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{location.country} · {TYPE_LABELS[location.type]}</div>
            </div>
          </div>
          {location.summary && (
            <div style={{ fontSize: 24, color: '#685F6D', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: tall ? 4 : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', borderTop: '1px solid #E1DEE2', paddingTop: 20 }}>{location.summary}</div>
          )}
          {/* Mini pin row */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <PinRow count={5} size={20} gap={10} />
            <Logo width={130} style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  STATIC MAP COMPONENT                                               */
/* ------------------------------------------------------------------ */

const TILE_SIZE = 256;
const TILE_URL = 'https://a.basemaps.cartocdn.com/rastertiles/voyager';

function lat2tile(lat: number, zoom: number) {
  return (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
}
function lng2tile(lng: number, zoom: number) {
  return (lng + 180) / 360 * Math.pow(2, zoom);
}

/**
 * Renders a static map from CARTO tiles centered on lat/lng.
 * Returns a div of exact width x height filled with tile images.
 * Optionally renders nearby location pins (grayed out).
 */
function StaticMap({ lat, lng, zoom, width, height, style, nearbyLocations }: {
  lat: number; lng: number; zoom: number; width: number; height: number; style?: React.CSSProperties;
  nearbyLocations?: { latitude: number; longitude: number }[];
}) {
  const centerTileX = lng2tile(lng, zoom);
  const centerTileY = lat2tile(lat, zoom);

  // Pixel position of center within its tile
  const centerPixelX = (centerTileX % 1) * TILE_SIZE;
  const centerPixelY = (centerTileY % 1) * TILE_SIZE;

  const baseTileX = Math.floor(centerTileX);
  const baseTileY = Math.floor(centerTileY);

  // How many tiles we need in each direction
  const tilesLeft = Math.ceil((width / 2 - centerPixelX) / TILE_SIZE) + 1;
  const tilesRight = Math.ceil((width / 2 - (TILE_SIZE - centerPixelX)) / TILE_SIZE) + 1;
  const tilesUp = Math.ceil((height / 2 - centerPixelY) / TILE_SIZE) + 1;
  const tilesDown = Math.ceil((height / 2 - (TILE_SIZE - centerPixelY)) / TILE_SIZE) + 1;

  const maxTile = Math.pow(2, zoom);
  const tiles: { x: number; y: number; left: number; top: number }[] = [];

  for (let dx = -tilesLeft; dx <= tilesRight; dx++) {
    for (let dy = -tilesUp; dy <= tilesDown; dy++) {
      const tx = ((baseTileX + dx) % maxTile + maxTile) % maxTile;
      const ty = baseTileY + dy;
      if (ty < 0 || ty >= maxTile) continue;
      tiles.push({
        x: tx,
        y: ty,
        left: width / 2 - centerPixelX + dx * TILE_SIZE,
        top: height / 2 - centerPixelY + dy * TILE_SIZE,
      });
    }
  }

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden', ...style }}>
      {tiles.map((t) => (
        <img
          key={`${t.x}-${t.y}`}
          src={`${TILE_URL}/${zoom}/${t.x}/${t.y}@2x.png`}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            left: t.left,
            top: t.top,
            width: TILE_SIZE,
            height: TILE_SIZE,
            imageRendering: 'auto',
          }}
        />
      ))}
      {/* Nearby location pins (grayed out) */}
      {nearbyLocations?.map((nl, i) => {
        const nlTileX = lng2tile(nl.longitude, zoom);
        const nlTileY = lat2tile(nl.latitude, zoom);
        const px = width / 2 + (nlTileX - centerTileX) * TILE_SIZE;
        const py = height / 2 + (nlTileY - centerTileY) * TILE_SIZE;
        // Skip if outside visible area (with margin)
        if (px < -30 || px > width + 30 || py < -30 || py > height + 30) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: px, top: py, transform: 'translate(-50%, -85%)', opacity: 0.55 }}>
            <Pin color="#685F6D" dotColor="#E1DEE2" size={42} />
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAP TEMPLATES                                                      */
/* ------------------------------------------------------------------ */

/**
 * MAP PIN — Full map with large branded pin centered, name + country bar at bottom
 */
function TemplateMapPin({ location, format, accent, mapZoom = 12, nearbyLocations }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden' }}>
      <StaticMap lat={location.latitude} lng={location.longitude} zoom={mapZoom} width={w} height={h} nearbyLocations={nearbyLocations} />
      {/* Large pin at center */}
      <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -85%)' }}>
        <Pin color={accent} dotColor={pinDot(accent)} size={120} />
      </div>
      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#00071A', padding: tall ? '44px 60px' : '36px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <TypeBadge type={location.type} badgeColor={accent} size={64} />
          <div>
            <div style={{ fontSize: tall ? 48 : 42, fontWeight: 700, color: '#fff', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
            <div style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)', fontFamily: 'Inter, sans-serif', marginTop: 6 }}>{location.country}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 24 }}>
          <PinRow count={5} size={24} gap={12} />
          <Logo width={150} style={{ opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}

/**
 * MAP CARD — Map background, floating white card with name/type/summary
 */
function TemplateMapCard({ location, format, accent, mapZoom = 11, nearbyLocations }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const cardW = w - 120;
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden' }}>
      <StaticMap lat={location.latitude} lng={location.longitude} zoom={mapZoom} width={w} height={h} nearbyLocations={nearbyLocations} />
      {/* Pin above the card */}
      <div style={{ position: 'absolute', left: '50%', top: tall ? '28%' : '22%', transform: 'translate(-50%, -85%)' }}>
        <Pin color={accent} dotColor={pinDot(accent)} size={90} />
      </div>
      {/* Card at bottom */}
      <div style={{ position: 'absolute', bottom: tall ? 60 : 48, left: 60, right: 60 }}>
        <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 28, padding: tall ? '44px 48px' : '36px 44px', boxShadow: '0 12px 48px rgba(0,0,0,0.15)' }}>
          {/* Accent top line */}
          <div style={{ position: 'absolute', top: 0, left: 48, right: 48, height: 5, background: accent, borderRadius: '0 0 3px 3px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
            <TypeBadge type={location.type} badgeColor={accent} size={58} />
            <div>
              <div style={{ fontSize: tall ? 44 : 38, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
              <div style={{ fontSize: 24, color: '#685F6D', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{location.country} · {TYPE_LABELS[location.type]}</div>
            </div>
          </div>
          {location.summary && (
            <div style={{ fontSize: 23, color: '#B4ADB8', fontFamily: 'Inter, sans-serif', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 16 }}>{location.summary}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <PinRow count={4} size={20} gap={10} />
            <Logo width={130} style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * MAP SPLIT — Left/top map with pin, right/bottom accent panel with info
 */
function TemplateMapSplit({ location, format, accent, mapZoom = 11, nearbyLocations }: TP) {
  const { w, h } = dims(format);
  const vertical = format === 'story';
  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: vertical ? 'column' : 'row', overflow: 'hidden' }}>
      {/* Map side */}
      <div style={{ flex: vertical ? '0 0 55%' : '0 0 55%', position: 'relative' }}>
        <StaticMap
          lat={location.latitude}
          lng={location.longitude}
          zoom={mapZoom}
          width={vertical ? w : w * 0.55}
          height={vertical ? h * 0.55 : h}
          nearbyLocations={nearbyLocations}
        />
        {/* Pin at center of map */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -85%)' }}>
          <Pin color={accent} dotColor={pinDot(accent)} size={80} />
        </div>
      </div>
      {/* Info side */}
      <div style={{ flex: 1, background: accent, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: vertical ? '44px 56px' : '44px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -40, pointerEvents: 'none', opacity: 0.15 }}>
          <BlobPink size={vertical ? 220 : 180} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <TypeBadge type={location.type} badgeColor={textOn(accent)} size={56} />
          <span style={{ fontSize: 24, fontWeight: 600, color: subtleOn(accent), fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
        </div>
        <div style={{ fontSize: vertical ? 52 : 46, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15, marginBottom: 16, position: 'relative', zIndex: 1 }}>{location.name}</div>
        <div style={{ fontSize: 26, color: subtleOn(accent), fontFamily: 'Inter, sans-serif', position: 'relative', zIndex: 1 }}>{location.country}</div>
        {location.summary && (
          <div style={{ fontSize: 23, color: textOn(accent), opacity: 0.55, fontFamily: 'Inter, sans-serif', lineHeight: 1.55, marginTop: 20, display: '-webkit-box', WebkitLineClamp: vertical ? 3 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', position: 'relative', zIndex: 1 }}>{location.summary}</div>
        )}
        <div style={{ marginTop: 'auto', paddingTop: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <PinRow count={vertical ? 4 : 3} size={24} gap={12} />
          <Logo width={140} style={{ opacity: accent === '#C2FF4E' ? 0.25 : 0.45, filter: accent === '#C2FF4E' ? 'none' : 'brightness(10)' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * MAP CIRCLE — Cream bg, map in large circle, text above/below, pin decorations
 */
function TemplateMapCircle({ location, format, accent, mapZoom = 12, nearbyLocations }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const circleSize = tall ? 700 : 620;
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Blob decoration */}
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}>
        <BlobPink size={tall ? 280 : 240} />
      </div>
      <div style={{ position: 'absolute', bottom: tall ? 120 : 60, left: 20, pointerEvents: 'none', opacity: 0.3 }}>
        <PinScatter size={tall ? 44 : 36} />
      </div>
      {/* Type + label above */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={52} />
        <span style={{ fontSize: 26, fontWeight: 600, color: '#685F6D', fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[location.type]}</span>
      </div>
      {/* Name above circle */}
      <div style={{ fontSize: tall ? 56 : 48, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.15, marginBottom: 36, maxWidth: w - 120, position: 'relative', zIndex: 1 }}>{location.name}</div>
      {/* Map circle */}
      <div style={{ width: circleSize, height: circleSize, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.1)', border: `6px solid ${accent}`, position: 'relative', zIndex: 1 }}>
        <StaticMap lat={location.latitude} lng={location.longitude} zoom={mapZoom} width={circleSize} height={circleSize} nearbyLocations={nearbyLocations} />
        {/* Pin at center */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -85%)' }}>
          <Pin color={accent} dotColor={pinDot(accent)} size={72} />
        </div>
      </div>
      {/* Country below */}
      <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
        <Pin color={accent} dotColor={pinDot(accent)} size={28} />
        <span style={{ fontSize: 28, color: '#685F6D', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{location.country}</span>
      </div>
      {/* Pin row footer */}
      <div style={{ position: 'absolute', bottom: tall ? 52 : 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 12 : 10} size={26} gap={18} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INFO TEMPLATES (carousel slide — description / episode)            */
/* ------------------------------------------------------------------ */

/**
 * INFO CLEAN — Cream bg, large summary, episode pill, type badge, blobs + pins
 */
function TemplateInfoClean({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: tall ? '72px 68px' : '56px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}><BlobPink size={tall ? 300 : 250} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 120 : 60, left: -10, pointerEvents: 'none', opacity: 0.3 }}><PinScatter size={tall ? 44 : 36} /></div>
      {/* Episode pill at top */}
      <div style={{ background: accent, color: textOn(accent), padding: '12px 28px', borderRadius: 100, fontSize: 24, fontWeight: 600, fontFamily: 'Inter, sans-serif', alignSelf: 'flex-start', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        {location.videoTitle}
      </div>
      {/* Header: type badge + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={72} />
        <div>
          <div style={{ fontSize: tall ? 56 : 48, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
          <div style={{ fontSize: 26, color: '#685F6D', fontFamily: 'Inter, sans-serif', marginTop: 6 }}>{location.country} · {TYPE_LABELS[location.type]}</div>
        </div>
      </div>
      {/* Accent divider */}
      <div style={{ width: 80, height: 5, background: accent, borderRadius: 3, marginBottom: 32, position: 'relative', zIndex: 1 }} />
      {/* Description — large text filling space */}
      <div style={{ fontSize: tall ? 40 : 36, color: '#00071A', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, position: 'relative', zIndex: 1, display: '-webkit-box', WebkitLineClamp: tall ? 14 : 10, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {location.description}
      </div>
      {/* Bottom */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 32, position: 'relative', zIndex: 1 }}>
        <PinRow count={5} size={24} gap={12} />
        <Logo width={160} style={{ opacity: 0.35 }} />
      </div>
    </div>
  );
}

/**
 * INFO DARK — Dark navy bg, white text, accent highlights, episode info
 */
function TemplateInfoDark({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, background: '#00071A', display: 'flex', flexDirection: 'column', padding: tall ? '72px 68px' : '56px 60px', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative pin scatter */}
      <div style={{ position: 'absolute', top: 40, right: 40, pointerEvents: 'none', opacity: 0.15 }}><PinScatter size={tall ? 52 : 42} /></div>
      {/* Episode label at top */}
      <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 24px', borderRadius: 100, fontSize: 22, color: accent, fontFamily: 'Inter, sans-serif', fontWeight: 600, alignSelf: 'flex-start', marginBottom: 36, position: 'relative', zIndex: 1 }}>
        {location.videoTitle}
      </div>
      {/* Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={68} />
        <div>
          <div style={{ fontSize: tall ? 52 : 46, fontWeight: 700, color: '#fff', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
          <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', marginTop: 6 }}>{location.country} · {TYPE_LABELS[location.type]}</div>
        </div>
      </div>
      {/* Accent line */}
      <div style={{ width: 80, height: 5, background: accent, borderRadius: 3, marginBottom: 32, position: 'relative', zIndex: 1 }} />
      {/* Summary */}
      <div style={{ fontSize: tall ? 32 : 28, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, flex: 1, position: 'relative', zIndex: 1, display: '-webkit-box', WebkitLineClamp: tall ? 12 : 8, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {location.description}
      </div>
      {/* Bottom */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 32, position: 'relative', zIndex: 1 }}>
        <PinRow count={6} size={26} gap={14} />
        <Logo width={170} style={{ opacity: 0.35, filter: 'brightness(10)' }} />
      </div>
    </div>
  );
}

/**
 * INFO QUOTE — Summary as a large quote with accent quotation marks, episode below
 */
function TemplateInfoQuote({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tall ? '80px 72px' : '60px 64px', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}><BlobPink size={tall ? 280 : 240} /></div>
      {/* Large accent quote mark */}
      <div style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 200, fontWeight: 700, color: accent, lineHeight: 0.8, marginBottom: -20, opacity: 0.5, position: 'relative', zIndex: 1 }}>"</div>
      {/* Summary as quote */}
      <div style={{ fontSize: tall ? 38 : 32, color: '#00071A', fontFamily: 'Inter, sans-serif', lineHeight: 1.65, textAlign: 'center', maxWidth: w - 160, position: 'relative', zIndex: 1, display: '-webkit-box', WebkitLineClamp: tall ? 10 : 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {location.description}
      </div>
      {/* Divider */}
      <div style={{ width: 60, height: 5, background: accent, borderRadius: 3, marginTop: 40, marginBottom: 32, position: 'relative', zIndex: 1 }} />
      {/* Location info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, position: 'relative', zIndex: 1 }}>
        <TypeBadge type={location.type} badgeColor={accent} size={52} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: tall ? 36 : 32, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', lineHeight: 1.2 }}>{location.name}</div>
          <div style={{ fontSize: 22, color: '#685F6D', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{location.country}</div>
        </div>
      </div>
      {/* Episode pill */}
      <div style={{ background: accent, color: textOn(accent), padding: '10px 28px', borderRadius: 100, fontSize: 22, fontWeight: 600, fontFamily: 'Inter, sans-serif', marginTop: 16, position: 'relative', zIndex: 1 }}>
        {location.videoTitle}
      </div>
      {/* Pin row footer */}
      <div style={{ position: 'absolute', bottom: tall ? 52 : 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 12 : 10} size={26} gap={18} />
      </div>
    </div>
  );
}

/**
 * INFO SPLIT — Accent top band with episode + type, cream bottom with large summary
 */
function TemplateInfoSplit({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, display: 'flex', flexDirection: tall ? 'column' : 'row', overflow: 'hidden' }}>
      {/* Accent side/top — compact header */}
      <div style={{ flex: tall ? '0 0 auto' : '0 0 38%', background: accent, padding: tall ? '48px 64px 44px' : '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: tall ? 'flex-start' : 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -40, pointerEvents: 'none', opacity: 0.15 }}><BlobPink size={tall ? 200 : 180} /></div>
        <div style={{ background: textOn(accent), color: accent, padding: '8px 22px', borderRadius: 100, fontSize: 20, fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'inline-block', alignSelf: 'flex-start', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          {location.videoTitle}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
          <TypeBadge type={location.type} badgeColor={textOn(accent)} size={56} />
          <div>
            <div style={{ fontSize: tall ? 44 : 38, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1.15 }}>{location.name}</div>
            <div style={{ fontSize: 22, color: subtleOn(accent), fontFamily: 'Inter, sans-serif', marginTop: 4 }}>{location.country}</div>
          </div>
        </div>
      </div>
      {/* Cream body — description fills the space */}
      <div style={{ flex: 1, background: '#F6F5F2', padding: tall ? '44px 64px' : '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: tall ? 80 : 40, right: -10, pointerEvents: 'none', opacity: 0.25 }}><PinScatter size={tall ? 44 : 36} /></div>
        <div style={{ fontSize: tall ? 38 : 34, color: '#00071A', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, position: 'relative', zIndex: 1, display: '-webkit-box', WebkitLineClamp: tall ? 16 : 10, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {location.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 24, position: 'relative', zIndex: 1 }}>
          <PinRow count={tall ? 6 : 4} size={24} gap={12} />
          <Logo width={150} style={{ opacity: 0.35 }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA TEMPLATES (last carousel slide)                                */
/* ------------------------------------------------------------------ */

/**
 * CTA CLEAN — Big logo, URL, clean branded design
 */
function TemplateCtaClean({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}><BlobPink size={tall ? 340 : 280} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 160 : 100, left: -10, pointerEvents: 'none', opacity: 0.3 }}><PinScatter size={tall ? 52 : 42} /></div>
      {/* Logo */}
      <Logo width={tall ? 520 : 480} style={{ marginBottom: 48, position: 'relative', zIndex: 1 }} />
      {/* Tagline */}
      <div style={{ fontSize: tall ? 44 : 38, fontWeight: 300, color: '#00071A', fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.4, maxWidth: w - 160, position: 'relative', zIndex: 1, marginBottom: 48 }}>
        Odkrywaj miejsca, historie i smaki znane z podróży <span style={{ fontWeight: 700 }}>Roberta Makłowicza</span>
      </div>
      {/* URL button */}
      <div style={{ background: accent, color: textOn(accent), padding: '20px 48px', borderRadius: 100, fontSize: 32, fontWeight: 700, fontFamily: 'Work Sans, sans-serif', position: 'relative', zIndex: 1 }}>
        sladami-maklowicza.pl
      </div>
      {/* Pin row */}
      <div style={{ position: 'absolute', bottom: tall ? 60 : 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 14 : 12} size={28} gap={18} />
      </div>
    </div>
  );
}

/**
 * CTA COUNTRY — "Odkryj tę i X innych miejsc w [country]"
 */
function TemplateCtaCountry({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const countryCount = countryLocationCounts[location.country] || 0;
  const otherCount = Math.max(0, countryCount - 1);
  const accentText = accent === '#C2FF4E' ? '#0016DE' : accent;
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tall ? '80px 72px' : '60px 64px', position: 'relative', overflow: 'hidden' }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}><BlobPink size={tall ? 320 : 270} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 140 : 80, left: -10, pointerEvents: 'none', opacity: 0.3 }}><PinScatter size={tall ? 52 : 42} /></div>
      {/* Logo */}
      <Logo width={tall ? 440 : 400} style={{ marginBottom: 56, position: 'relative', zIndex: 1 }} />
      {/* Big country count */}
      <div style={{ fontSize: tall ? 120 : 100, fontWeight: 700, color: accentText, fontFamily: 'Work Sans, sans-serif', lineHeight: 1, position: 'relative', zIndex: 1 }}>
        {otherCount}+
      </div>
      {/* Main CTA text */}
      <div style={{ fontSize: tall ? 46 : 40, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.35, maxWidth: w - 140, position: 'relative', zIndex: 1, marginTop: 12, marginBottom: 16 }}>
        miejsc do odkrycia w&nbsp;{location.country}
      </div>
      <div style={{ fontSize: 28, color: '#B4ADB8', fontFamily: 'Inter, sans-serif', textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 48 }}>
        Restauracje, atrakcje, muzea i więcej — wszystko na jednej mapie
      </div>
      {/* URL button */}
      <div style={{ background: '#00071A', color: '#fff', padding: '20px 48px', borderRadius: 100, fontSize: 32, fontWeight: 700, fontFamily: 'Work Sans, sans-serif', position: 'relative', zIndex: 1 }}>
        sladami-maklowicza.pl
      </div>
      {/* Pin row */}
      <div style={{ position: 'absolute', bottom: tall ? 60 : 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 14 : 12} size={28} gap={18} />
      </div>
    </div>
  );
}

/**
 * CTA GLOBAL — "Odkryj X lokalizacji na całym świecie"
 */
function TemplateCtaGlobal({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  return (
    <div style={{ width: w, height: h, background: accent, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tall ? '80px 72px' : '60px 64px', position: 'relative', overflow: 'hidden' }}>
      {/* Blob */}
      <div style={{ position: 'absolute', top: -40, right: -60, pointerEvents: 'none', opacity: 0.15 }}><BlobPink size={tall ? 320 : 260} /></div>
      {/* Logo */}
      <Logo width={tall ? 460 : 420} style={{ marginBottom: 56, position: 'relative', zIndex: 1, filter: accent === '#C2FF4E' ? 'none' : 'brightness(10)' }} />
      {/* Big number */}
      <div style={{ fontSize: tall ? 140 : 120, fontWeight: 700, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', lineHeight: 1, position: 'relative', zIndex: 1, opacity: 0.9 }}>
        {totalLocationCount}
      </div>
      <div style={{ fontSize: tall ? 40 : 34, fontWeight: 600, color: textOn(accent), fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.35, maxWidth: w - 160, position: 'relative', zIndex: 1, marginTop: 8, marginBottom: 16 }}>
        miejsc do odkrycia na całym świecie
      </div>
      <div style={{ fontSize: 26, color: subtleOn(accent), fontFamily: 'Inter, sans-serif', textAlign: 'center', position: 'relative', zIndex: 1, marginBottom: 48 }}>
        {totalCountryCount} krajów · {totalEpisodeCount} odcinków
      </div>
      {/* URL */}
      <div style={{ background: textOn(accent), color: accent, padding: '20px 48px', borderRadius: 100, fontSize: 32, fontWeight: 700, fontFamily: 'Work Sans, sans-serif', position: 'relative', zIndex: 1 }}>
        sladami-maklowicza.pl
      </div>
      {/* Pin row */}
      <div style={{ position: 'absolute', bottom: tall ? 60 : 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 14 : 12} size={28} gap={18} />
      </div>
    </div>
  );
}

/**
 * CTA STATS — Stats grid (locations, countries, episodes) + logo + URL
 */
function TemplateCtaStats({ location, format, accent }: TP) {
  const { w, h } = dims(format);
  const tall = format !== 'square';
  const stats = [
    { value: totalLocationCount, label: 'Miejsc' },
    { value: totalCountryCount, label: 'Krajów' },
    { value: totalEpisodeCount, label: 'Odcinków' },
  ];
  return (
    <div style={{ width: w, height: h, background: '#F6F5F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: tall ? '80px 64px' : '56px 56px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -50, right: -60, pointerEvents: 'none' }}><BlobPink size={tall ? 300 : 250} /></div>
      <div style={{ position: 'absolute', bottom: tall ? 140 : 80, left: -10, pointerEvents: 'none', opacity: 0.25 }}><PinScatter size={tall ? 48 : 38} /></div>
      {/* Logo */}
      <Logo width={tall ? 420 : 380} style={{ marginBottom: tall ? 56 : 44, position: 'relative', zIndex: 1 }} />
      {/* Stats row */}
      <div style={{ display: 'flex', gap: tall ? 48 : 36, marginBottom: tall ? 48 : 36, position: 'relative', zIndex: 1 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: tall ? 72 : 60, fontWeight: 700, color: accent === '#C2FF4E' ? '#00071A' : accent, fontFamily: 'Work Sans, sans-serif', lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: tall ? 24 : 20, color: '#685F6D', fontFamily: 'Inter, sans-serif', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {/* Tagline */}
      <div style={{ fontSize: tall ? 36 : 30, fontWeight: 300, color: '#00071A', fontFamily: 'Work Sans, sans-serif', textAlign: 'center', lineHeight: 1.45, maxWidth: w - 160, position: 'relative', zIndex: 1, marginBottom: 44 }}>
        Znajdź najlepsze restauracje, atrakcje i ukryte perełki <span style={{ fontWeight: 700 }}>Roberta Makłowicza</span>
      </div>
      {/* URL button */}
      <div style={{ background: '#00071A', color: '#fff', padding: '20px 48px', borderRadius: 100, fontSize: 32, fontWeight: 700, fontFamily: 'Work Sans, sans-serif', position: 'relative', zIndex: 1 }}>
        sladami-maklowicza.pl
      </div>
      {/* Pin row */}
      <div style={{ position: 'absolute', bottom: tall ? 56 : 36, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1 }}>
        <PinRow count={tall ? 14 : 12} size={28} gap={18} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TEMPLATE ROUTER                                                    */
/* ------------------------------------------------------------------ */

function Template({ variant, location, format, accent, mapZoom, nearbyLocations }: { variant: VariantId; location: LocationWithVideo; format: Format; accent: string; mapZoom?: number; nearbyLocations?: LocationWithVideo[] }) {
  const props = { location, format, accent, mapZoom, nearbyLocations };
  switch (variant) {
    case 'bold': return <TemplateBold {...props} />;
    case 'split': return <TemplateSplit {...props} />;
    case 'polaroid': return <TemplatePolaroid {...props} />;
    case 'frame': return <TemplateFrame {...props} />;
    case 'magazine': return <TemplateMagazine {...props} />;
    case 'minimal': return <TemplateMinimal {...props} />;
    case 'overlay': return <TemplateOverlay {...props} />;
    case 'card': return <TemplateCard {...props} />;
    case 'duo': return <TemplateDuo {...props} />;
    case 'stamp': return <TemplateStamp {...props} />;
    case 'cinematic': return <TemplateCinematic {...props} />;
    case 'quote': return <TemplateQuote {...props} />;
    case 'mapPin': return <TemplateMapPin {...props} />;
    case 'mapCard': return <TemplateMapCard {...props} />;
    case 'mapSplit': return <TemplateMapSplit {...props} />;
    case 'mapCircle': return <TemplateMapCircle {...props} />;
    case 'infoClean': return <TemplateInfoClean {...props} />;
    case 'infoDark': return <TemplateInfoDark {...props} />;
    case 'infoQuote': return <TemplateInfoQuote {...props} />;
    case 'infoSplit': return <TemplateInfoSplit {...props} />;
    case 'ctaClean': return <TemplateCtaClean {...props} />;
    case 'ctaCountry': return <TemplateCtaCountry {...props} />;
    case 'ctaGlobal': return <TemplateCtaGlobal {...props} />;
    case 'ctaStats': return <TemplateCtaStats {...props} />;
  }
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE                                                          */
/* ------------------------------------------------------------------ */

export default function InstagramPage() {
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationWithVideo | null>(null);
  const [format, setFormat] = useState<Format>('portrait');
  const [accentIdx, setAccentIdx] = useState(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [showNearby, setShowNearby] = useState(false);
  const templateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const accent = ACCENT_COLORS[accentIdx];
  const { w: canvasW, h: canvasH } = dims(format);

  // Compute nearby locations (exclude the selected one)
  const nearbyLocations = React.useMemo(() => {
    if (!showNearby || !selectedLocation) return undefined;
    return allLocations.filter((l) => l.id !== selectedLocation.id);
  }, [showNearby, selectedLocation]);

  const filtered = search.trim()
    ? allLocations
        .filter(
          (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.country.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 50)
    : allLocations.slice(0, 50);

  const handleDownload = useCallback(
    async (variantId: string) => {
      const el = templateRefs.current[variantId];
      if (!el || !selectedLocation) return;
      setDownloading(variantId);
      try {
        const canvas = await html2canvas(el, { scale: 1, useCORS: true, allowTaint: true, backgroundColor: null });
        const link = document.createElement('a');
        const slug = selectedLocation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
        link.download = `ig-${variantId}-${format}-${slug}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error('Download failed', err);
        alert('Nie udało się wygenerować PNG — sprawdź konsolę.');
      } finally {
        setDownloading(null);
      }
    },
    [selectedLocation, format]
  );

  const scale = format === 'story' ? 0.26 : format === 'portrait' ? 0.3 : 0.35;

  return (
    <>
      <Head><title>Instagram Templates – Admin</title></Head>
      <div style={{ minHeight: '100vh', background: '#F6F5F2', fontFamily: 'Inter, sans-serif' }}>
        {/* Header */}
        <div style={{ background: '#00071A', color: '#fff', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/admin/studio" style={{ color: '#B4ADB8', fontSize: 14, textDecoration: 'none' }}>← Studio</a>
            <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Work Sans, sans-serif' }}>Instagram Templates</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {(['square', 'portrait', 'story'] as Format[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 100,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  background: format === f ? '#C2FF4E' : 'rgba(255,255,255,0.1)',
                  color: format === f ? '#00071A' : '#fff',
                }}
              >
                {FORMAT_DIMS[f].label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 6, marginLeft: 16 }}>
              {ACCENT_COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setAccentIdx(i)}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: accentIdx === i ? '3px solid #fff' : '3px solid transparent', cursor: 'pointer', padding: 0 }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* Sidebar */}
          <div style={{ width: 360, borderRight: '1px solid #E1DEE2', background: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16 }}>
              <input
                type="text"
                placeholder="Szukaj miejsca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 16px', borderRadius: 12, border: '1px solid #E1DEE2', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  style={{ width: '100%', padding: '12px 16px', border: 'none', borderBottom: '1px solid #F6F5F2', background: selectedLocation?.id === loc.id ? '#F6F5F2' : 'transparent', cursor: 'pointer', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center' }}
                >
                  <img src={loc.image!} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#00071A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc.name}</div>
                    <div style={{ fontSize: 12, color: '#685F6D' }}>{loc.country} · {TYPE_LABELS[loc.type]}</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: '#B4ADB8', fontSize: 14 }}>Brak wyników</div>}
            </div>
          </div>

          {/* Previews */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
            {!selectedLocation ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#B4ADB8', fontSize: 18 }}>Wybierz miejsce z listy po lewej</div>
            ) : (
              <>
                {[
                  { key: 'photo', label: 'Photo Templates', items: VARIANTS.filter((v) => !v.group) },
                  { key: 'map', label: 'Map Templates (carousel slide)', items: VARIANTS.filter((v) => v.group === 'map') },
                  { key: 'info', label: 'Info Templates (carousel slide)', items: VARIANTS.filter((v) => v.group === 'info') },
                  { key: 'cta', label: 'CTA Templates (last carousel slide)', items: VARIANTS.filter((v) => v.group === 'cta') },
                ].map((section) => (
                  <div key={section.key} style={{ marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#B4ADB8', fontFamily: 'Work Sans, sans-serif', textTransform: 'uppercase', letterSpacing: 2 }}>{section.label}</div>
                      {section.key === 'map' && (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#685F6D', fontWeight: 600 }}>Zoom</span>
                            <input
                              type="range"
                              min={4}
                              max={16}
                              value={mapZoom}
                              onChange={(e) => setMapZoom(Number(e.target.value))}
                              style={{ width: 120, accentColor: '#0016DE' }}
                            />
                            <span style={{ fontSize: 12, color: '#685F6D', fontFamily: 'monospace', minWidth: 20 }}>{mapZoom}</span>
                          </div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#685F6D', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={showNearby}
                              onChange={(e) => setShowNearby(e.target.checked)}
                              style={{ accentColor: '#0016DE', width: 16, height: 16 }}
                            />
                            Inne lokalizacje
                          </label>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${canvasW * scale + 16}px, 1fr))`, gap: 32 }}>
                      {section.items.map((v) => (
                        <div key={v.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: canvasW * scale }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#00071A', fontFamily: 'Work Sans, sans-serif' }}>{v.name}</span>
                            <button
                              onClick={() => handleDownload(v.id)}
                              disabled={downloading === v.id}
                              style={{ padding: '6px 18px', borderRadius: 100, border: 'none', background: '#00071A', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: downloading === v.id ? 0.5 : 1 }}
                            >
                              {downloading === v.id ? 'Generuję...' : '↓ PNG'}
                            </button>
                          </div>
                          <div style={{ width: canvasW * scale, height: canvasH * scale, overflow: 'hidden', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
                            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: canvasW, height: canvasH }}>
                              <div ref={(el) => { templateRefs.current[v.id] = el; }}>
                                <Template variant={v.id} location={selectedLocation} format={format} accent={accent} {...(v.group === 'map' ? { mapZoom, nearbyLocations } : {})} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
