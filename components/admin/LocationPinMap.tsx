import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Required in every Leaflet module loaded independently (same fix as Map.tsx)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPinMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = React.useRef<[number, number] | null>(null);

  React.useEffect(() => {
    if (Math.abs(lat) < 0.001 && Math.abs(lng) < 0.001) return;
    const prev = prevRef.current;
    if (!prev || prev[0] !== lat || prev[1] !== lng) {
      map.flyTo([lat, lng], 15);
      prevRef.current = [lat, lng];
    }
  }, [lat, lng, map]);

  return null;
}

export default function LocationPinMap({ latitude, longitude, onChange }: LocationPinMapProps) {
  const isValid = Math.abs(latitude) > 0.001 || Math.abs(longitude) > 0.001;
  const center: [number, number] = isValid ? [latitude, longitude] : [48, 15];

  return (
    <div style={{ height: '350px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={isValid ? 15 : 4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        />
        <MapController lat={latitude} lng={longitude} />
        {isValid && (
          <Marker
            position={[latitude, longitude]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = (e.target as L.Marker).getLatLng();
                onChange(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
