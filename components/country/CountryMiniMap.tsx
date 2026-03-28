import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapIcon } from 'lucide-react';
import type { Location } from '../../types/Location';
import { useIconCache } from '../../hooks/useIconCache';
import { createClusterCustomIcon } from '../map/ClusterIcon';

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 10 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function Markers({ locations }: { locations: Location[] }) {
  const { getIcon } = useIconCache();

  const markers = useMemo(
    () =>
      locations.map((loc) => {
        const position: LatLngExpression = [loc.latitude, loc.longitude];
        const icon = getIcon(loc.type, '', false, false, false);
        return (
          <Marker
            key={loc.id}
            position={position}
            icon={icon}
            interactive={false}
            // @ts-ignore — custom prop used by cluster icon logic
            locationType={loc.type}
          />
        );
      }),
    [locations, getIcon]
  );

  return (
    <MarkerClusterGroup
      iconCreateFunction={createClusterCustomIcon}
      maxClusterRadius={60}
      spiderfyOnMaxZoom={false}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={false}
      animate={false}
      animateAddingMarkers={false}
      chunkedLoading={true}
    >
      {markers}
    </MarkerClusterGroup>
  );
}

interface Props {
  locations: Location[];
  country: string;
}

export default function CountryMiniMap({ locations, country }: Props) {
  return (
    <a
      href={`/map?country=${encodeURIComponent(country)}`}
      className="block relative rounded-2xl overflow-hidden border border-secondary-border group"
      style={{ height: 220 }}
    >
      {/* Map — pointer-events disabled so clicks pass through to the <a> */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none', zIndex: 0 }}>
        <MapContainer
          zoom={4}
          center={[50, 20]}
          style={{ height: '100%', width: '100%', background: '#f8f5f0' }}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
          doubleClickZoom={false}
          keyboard={false}
          touchZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            maxZoom={10}
          />
          <FitBounds locations={locations} />
          <Markers locations={locations} />
        </MapContainer>
      </div>

      {/* Bottom scrim + CTA — must sit above Leaflet's internal pane z-indices */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 flex items-end justify-center pb-4 bg-gradient-to-t from-black/50 to-transparent"
        style={{ zIndex: 1000 }}
      >
        <span className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-neutral-1000 text-neutral-0 font-semibold text-base hover:bg-neutral-1000/90 transition-colors">
          <MapIcon className="w-4 h-4" />
          Odkryj wszystkie miejsca na mapie
        </span>
      </div>
    </a>
  );
}
