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

    const customIcon = (location: Location, isSelected: boolean): DivIcon => {
        let icon = '📍'; // default icon for 'other'
        if (location.type === 'restaurant') {
            icon = '🍴';
        } else if (location.type === 'attraction') {
            icon = '🏛️';
        }

        return new L.DivIcon({
            className: 'custom-marker',
            html: `<div style="
                width: 32px;
                height: 32px;
                background-color: ${isSelected ? 'rgb(88, 202, 229)' : '#2c1810'};
                border: 2px solid #f8f5f0;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: background-color 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: #f8f5f0;
            ">${icon}</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    };

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
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
                <ChangeView locations={locations} />
                {locations.map((location) => {
                    const position: LatLngExpression = [location.latitude, location.longitude];
                    const isSelected = selectedLocation?.id === location.id;
                    
                    return (
                        <Marker
                            key={location.id}
                            position={position}
                            icon={customIcon(location, isSelected)}
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
                    font-family: inherit;
                }
                .leaflet-tile {
                    filter: sepia(10%) hue-rotate(10deg) brightness(103%) contrast(95%) saturate(85%);
                }
                .custom-marker {
                    background: none;
                    border: none;
                }
                /* Control styling */
                .leaflet-control-zoom {
                    border: none !important;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
                }
                .leaflet-control-zoom a {
                    background-color: #f8f5f0 !important;
                    color: #2c1810 !important;
                    border: 1px solid #e6dfd7 !important;
                    width: 32px !important;
                    height: 32px !important;
                    line-height: 30px !important;
                    font-size: 16px !important;
                    transition: all 0.2s ease;
                }
                .leaflet-control-zoom a:hover {
                    background-color: #f4ede4 !important;
                    color: #6b4c40 !important;
                }
                .leaflet-control-zoom-in {
                    border-top-left-radius: 6px !important;
                    border-top-right-radius: 6px !important;
                }
                .leaflet-control-zoom-out {
                    border-bottom-left-radius: 6px !important;
                    border-bottom-right-radius: 6px !important;
                }
                /* Attribution styling */
                .leaflet-control-attribution {
                    background-color: rgba(248, 245, 240, 0.9) !important;
                    color: #6b4c40 !important;
                    font-size: 11px !important;
                    padding: 3px 8px !important;
                    border-radius: 4px !important;
                }
                .leaflet-control-attribution a {
                    color: #2c1810 !important;
                }
                /* Remove tile borders */
                .leaflet-tile-container img {
                    border: none !important;
                }
            `}</style>
        </div>
    );
};

export default Map; 