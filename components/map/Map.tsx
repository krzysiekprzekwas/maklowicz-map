import React from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { LatLngBoundsExpression, LatLngExpression, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../../types/Location';
import L from 'leaflet';
import createCustomIcon from '../location/LocationMapIcon';
import { createClusterCustomIcon } from './ClusterIcon';
import { useIconCache } from '../../hooks/useIconCache';
import { isMobileDevice } from '../../src/lib/deviceDetection';

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
    const { getIcon } = useIconCache();
    const [isMobile, setIsMobile] = React.useState(false);

    // Detect mobile device on mount
    React.useEffect(() => {
        setIsMobile(isMobileDevice());
        
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Filter out filtered-out locations entirely (don't render them)
    const visibleLocations = React.useMemo(() => 
        locations.filter(location => !location.isFilteredOut),
        [locations]
    );

    // Memoize the custom icon creation with caching
    const customIcon = React.useCallback((location: Location, isSelected: boolean): DivIcon => {
        return getIcon(location.type, location.name, isSelected, false, isMobile);
    }, [getIcon, isMobile]);

    // Memoize markers to prevent unnecessary re-renders
    const markerElements = React.useMemo(() => 
        visibleLocations.map((location) => {
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
                    // Store location type for clustering logic
                    // @ts-ignore - Custom property for cluster icon
                    locationType={location.type}
                />
            );
        }),
    [visibleLocations, selectedLocation, customIcon, onLocationSelect]);

    // Canvas renderer for better mobile performance
    const canvasRenderer = React.useMemo(() => 
        L.canvas({ 
            tolerance: isMobile ? 10 : 5,
            padding: 0.5 
        }), 
        [isMobile]
    );

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
                preferCanvas={isMobile}
                renderer={canvasRenderer}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                    maxZoom={maxZoomValue}
                    maxNativeZoom={maxZoomValue}
                />
                <ChangeView locations={visibleLocations} />
                
                {/* MarkerClusterGroup with custom icon and subtle clustering */}
                <MarkerClusterGroup
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={isMobile ? 60 : 80}
                    spiderfyOnMaxZoom={false}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
                    disableClusteringAtZoom={8}
                    animate={!isMobile}
                    animateAddingMarkers={false}
                    removeOutsideVisibleBounds={true}
                    chunkedLoading={true}
                >
                    {markerElements}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
});

export default Map;