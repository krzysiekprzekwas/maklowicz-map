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
import { AnimatePresence } from 'framer-motion';
import { LocationPreview } from '../location/LocationPreview';

const maxZoomValue = 20;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    locations: Location[];
    selectedLocation: Location | null;
    previewLocation: Location | null;
    onLocationSelect: (location: Location) => void;
    onLocationPreview: (location: Location) => void;
    onClosePreview: () => void;
    userLat?: number;
    userLng?: number;
}

// Tracks the pixel position of previewLocation as the map pans/zooms.
// Must live inside MapContainer to access useMap().
const PositionTracker: React.FC<{
    location: Location | null;
    onPositionUpdate: (pos: { x: number; y: number } | null) => void;
}> = ({ location, onPositionUpdate }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!location) {
            onPositionUpdate(null);
            return;
        }
        const update = () => {
            const pt = map.latLngToContainerPoint([location.latitude, location.longitude]);
            onPositionUpdate({ x: pt.x, y: pt.y });
        };
        update();
        map.on('move zoom moveend zoomend', update);
        return () => { map.off('move zoom moveend zoomend', update); };
    }, [location, map, onPositionUpdate]);

    return null;
};

const ChangeView: React.FC<{ locations: Location[] }> = React.memo(({ locations }) => {
    const map = useMap();
    React.useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(
                locations.filter(x => !x.isFilteredOut).map(loc => [loc.latitude, loc.longitude])
            );
            map.fitBounds(bounds as LatLngBoundsExpression, { padding: [50, 50], maxZoom: maxZoomValue });
        }
    }, [locations]);
    return null;
});

const Map: React.FC<MapProps> = React.memo(({
    locations,
    selectedLocation,
    previewLocation,
    onLocationSelect,
    onLocationPreview,
    onClosePreview,
    userLat,
    userLng,
}) => {
    const { getIcon } = useIconCache();
    const [isMobile, setIsMobile] = React.useState(() => isMobileDevice());
    const [previewPixelPos, setPreviewPixelPos] = React.useState<{ x: number; y: number } | null>(null);

    // Ref so marker event closures always see the latest previewLocation
    // without invalidating the markers memo on every preview change.
    const previewLocationRef = React.useRef(previewLocation);
    previewLocationRef.current = previewLocation;

    // Timer ref for desktop hover hide delay
    const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setIsMobile(isMobileDevice());
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const startHideTimer = React.useCallback(() => {
        hideTimerRef.current = setTimeout(onClosePreview, 300);
    }, [onClosePreview]);

    const cancelHideTimer = React.useCallback(() => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    }, []);

    const handlePositionUpdate = React.useCallback(
        (pos: { x: number; y: number } | null) => setPreviewPixelPos(pos),
        []
    );

    const visibleLocations = React.useMemo(
        () => locations.filter(loc => !loc.isFilteredOut),
        [locations]
    );

    const customIcon = React.useCallback(
        (location: Location, isSelected: boolean): DivIcon =>
            getIcon(location.type, location.name, isSelected, false, isMobile),
        [getIcon, isMobile]
    );

    const markerElements = React.useMemo(
        () => visibleLocations.map(location => {
            const position: LatLngExpression = [location.latitude, location.longitude];
            const isSelected = selectedLocation?.id === location.id;

            return (
                <Marker
                    key={location.id}
                    position={position}
                    icon={customIcon(location, isSelected)}
                    eventHandlers={{
                        // Desktop: hover shows preview
                        mouseover: () => {
                            if (!isMobile) {
                                cancelHideTimer();
                                onLocationPreview(location);
                            }
                        },
                        mouseout: () => {
                            if (!isMobile) startHideTimer();
                        },
                        // Mobile: first tap = preview, second tap (same marker) = full details
                        // Desktop: click = full details directly
                        click: () => {
                            if (isMobile) {
                                if (previewLocationRef.current?.id === location.id) {
                                    onLocationSelect(location);
                                } else {
                                    onLocationPreview(location);
                                }
                            } else {
                                onLocationSelect(location);
                            }
                        },
                    }}
                    // @ts-ignore — custom prop for cluster icon logic
                    locationType={location.type}
                />
            );
        }),
        [visibleLocations, selectedLocation, customIcon, onLocationSelect, onLocationPreview,
         isMobile, cancelHideTimer, startHideTimer]
    );

    const canvasRenderer = React.useMemo(
        () => L.canvas({ tolerance: isMobile ? 10 : 5, padding: 0.5 }),
        [isMobile]
    );

    const userLocationIcon = React.useMemo(() => L.divIcon({
        className: '',
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#1a1a1a;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    }), []);

    return (
        <div className="w-full h-full relative bg-secondary">
            <MapContainer
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#f8f5f0' }}
                scrollWheelZoom={true}
                zoomControl={!isMobile}
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
                <PositionTracker
                    location={previewLocation}
                    onPositionUpdate={handlePositionUpdate}
                />
                <ChangeView locations={visibleLocations} />
                {userLat != null && userLng != null && (
                    <Marker
                        position={[userLat, userLng]}
                        icon={userLocationIcon}
                        zIndexOffset={1000}
                        interactive={false}
                    />
                )}
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

            {/* Preview card — animated overlay anchored to marker position */}
            <AnimatePresence>
                {previewLocation && previewPixelPos && (
                    <LocationPreview
                        key={previewLocation.id}
                        location={previewLocation}
                        pixelPosition={previewPixelPos}
                        onOpenDetails={() => onLocationSelect(previewLocation)}
                        onClose={onClosePreview}
                        onMouseEnter={cancelHideTimer}
                        onMouseLeave={startHideTimer}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

export default Map;
