import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LatLngBoundsExpression, LatLngExpression, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types/Location';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    locations: Location[];
    selectedLocation: Location | null;
    onLocationSelect: (location: Location | null) => void;
}

// Custom component to fit bounds
function ChangeView({ locations }: { locations: Location[] }) {
    const map = useMap();
    
    React.useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(loc => [loc.latitude, loc.longitude]));
            map.fitBounds(bounds as LatLngBoundsExpression, { padding: [50, 50] });
        }
    }, [locations, map]);

    return null;
}

const Map = ({ locations, selectedLocation, onLocationSelect }: MapProps) => {
    const krakowPosition: LatLngExpression = [50.0614300, 19.9365800];

    const customIcon = (isSelected: boolean): DivIcon => new L.DivIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 24px;
            height: 24px;
            background-color: ${isSelected ? 'rgb(88, 202, 229)' : '#2c1810'};
            border: 2px solid #f8f5f0;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: background-color 0.3s ease;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    return (
        <div className="w-full h-full relative bg-secondary">
            <MapContainer
                center={krakowPosition}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#f8f5f0' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView locations={locations} />
                {locations.map((location) => {
                    const position: LatLngExpression = [location.latitude, location.longitude];
                    const isSelected = selectedLocation?.id === location.id;
                    
                    return (
                        <Marker
                            key={location.id}
                            position={position}
                            icon={customIcon(isSelected)}
                            eventHandlers={{
                                click: () => onLocationSelect(location),
                            }}
                        />
                    );
                })}
            </MapContainer>
            <style jsx global>{`
                .leaflet-container {
                    background-color: #f8f5f0 !important;
                }
                .leaflet-tile {
                    filter: sepia(20%) hue-rotate(10deg) brightness(105%);
                }
                .custom-marker {
                    background: none;
                    border: none;
                }
            `}</style>
        </div>
    );
};

export default Map; 