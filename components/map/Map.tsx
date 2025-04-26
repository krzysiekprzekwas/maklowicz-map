import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { LatLngBoundsExpression, LatLngExpression, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types/Location';
import L from 'leaflet';
import createCustomIcon from '../location/LocationMapIcon';

const maxZoomValue = 20;

// Fix for default marker icons
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

// Memoized ChangeView component
const ChangeView: React.FC<{ locations: Location[] }> = React.memo(({ locations }) => {
    const map = useMap();
    
    React.useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.filter(x => !x.isFilteredOut).map(loc => [loc.latitude, loc.longitude]));
            map.fitBounds(bounds as LatLngBoundsExpression, { 
                padding: [50, 50],
                maxZoom: maxZoomValue 
            });
        }
    }, [locations]);

    return null;
});

const Map: React.FC<MapProps> = React.memo(({ locations, selectedLocation, onLocationSelect }) => {
    // Memoize the custom icon creation
    const customIcon = React.useCallback((location: Location, isSelected: boolean): DivIcon => {
            return createCustomIcon(location.type, isSelected, location.isFilteredOut);
    }, []);

    // Memoize markers to prevent unnecessary re-renders
    const markerElements = React.useMemo(() => 
        locations.map((location) => {
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
        }),
    [locations, selectedLocation, customIcon, onLocationSelect]);

    return (
        <div className="w-full h-full relative bg-secondary">
            <MapContainer
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#f8f5f0' }}
                scrollWheelZoom={true}
                zoomControl={true}
                attributionControl={true}
                minZoom={3}
                maxZoom={maxZoomValue}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    maxZoom={maxZoomValue}
                    maxNativeZoom={maxZoomValue}
                />
                <ChangeView locations={locations} />
                {markerElements}
            </MapContainer>
        </div>
    );
});

export default Map;