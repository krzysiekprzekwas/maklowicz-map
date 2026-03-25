import React from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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
    zoomLocations?: Location[];
    selectedLocation: Location | null;
    previewLocation: Location | null;
    onLocationSelect: (location: Location) => void;
    onLocationPreview: (location: Location) => void;
    onClosePreview: () => void;
    userLat?: number;
    userLng?: number;
    leftPanelWidth?: number;
    flyToLocation?: Location | null;
    onFlyToComplete?: () => void;
    rightPanelWidth?: number;
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

const MapClickCloser: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    useMapEvents({ click: onClose });
    return null;
};

const PreviewPanner: React.FC<{ location: Location | null }> = ({ location }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!location) return;

        const CARD_WIDTH = 260;
        const CARD_HEIGHT = location.image ? 224 : 80;
        const PADDING = 12;

        const pt = map.latLngToContainerPoint([location.latitude, location.longitude]);

        const cardTop    = pt.y - 8 - CARD_HEIGHT;
        const cardBottom = pt.y - 8;
        const cardLeft   = pt.x - CARD_WIDTH / 2;
        const cardRight  = pt.x + CARD_WIDTH / 2;

        const mapEl = map.getContainer();
        const safeTop    = PADDING;
        const safeBottom = mapEl.clientHeight - PADDING;
        const safeLeft   = PADDING;
        const safeRight  = mapEl.clientWidth  - PADDING;

        let dx = 0, dy = 0;
        if      (cardTop    < safeTop)    dy = cardTop    - safeTop;
        else if (cardBottom > safeBottom) dy = cardBottom - safeBottom;
        if      (cardLeft   < safeLeft)   dx = cardLeft   - safeLeft;
        else if (cardRight  > safeRight)  dx = cardRight  - safeRight;

        if (dx !== 0 || dy !== 0) {
            map.panBy([dx, dy], { animate: true });
        }
    }, [location, map]);

    return null;
};

const LocationFlyTo: React.FC<{ location: Location | null; rightPanelWidth: number; onComplete: () => void }> = ({ location, rightPanelWidth, onComplete }) => {
    const map = useMap();
    React.useEffect(() => {
        if (!location) return;
        const zoom = 14;
        // Offset the target point leftward by half the right panel width so the
        // pin lands in the centre of the visible map area, not behind the panel.
        const targetPt = map.project([location.latitude, location.longitude], zoom);
        targetPt.x += rightPanelWidth / 2;
        const adjustedLatLng = map.unproject(targetPt, zoom);
        map.flyTo(adjustedLatLng, zoom, { animate: true, duration: 1 });
        onComplete();
    }, [location]);
    return null;
};

const ChangeView: React.FC<{ zoomLocations: Location[]; leftPanelWidth?: number }> = React.memo(
    ({ zoomLocations, leftPanelWidth = 0 }) => {
        const map = useMap();
        React.useEffect(() => {
            if (zoomLocations.length > 0) {
                const bounds = L.latLngBounds(
                    zoomLocations.map(loc => [loc.latitude, loc.longitude])
                );
                map.fitBounds(bounds as LatLngBoundsExpression, {
                    paddingTopLeft: [50 + leftPanelWidth, 50],
                    paddingBottomRight: [50, 50],
                    maxZoom: maxZoomValue,
                });
            }
        }, [zoomLocations, leftPanelWidth]);
        return null;
    }
);

const Map: React.FC<MapProps> = React.memo(({
    locations,
    zoomLocations,
    selectedLocation,
    previewLocation,
    onLocationSelect,
    onLocationPreview,
    onClosePreview,
    userLat,
    userLng,
    leftPanelWidth = 0,
    flyToLocation,
    onFlyToComplete,
    rightPanelWidth = 0,
}) => {
    const { getIcon } = useIconCache();
    const [isMobile, setIsMobile] = React.useState(() => isMobileDevice());
    const [previewPixelPos, setPreviewPixelPos] = React.useState<{ x: number; y: number } | null>(null);

    // Ref so marker event closures always see the latest previewLocation
    // without invalidating the markers memo on every preview change.
    const previewLocationRef = React.useRef(previewLocation);
    previewLocationRef.current = previewLocation;

    React.useEffect(() => {
        setIsMobile(isMobileDevice());
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                        // First click = preview, second click on same marker = full details
                        click: () => {
                            if (previewLocationRef.current?.id === location.id) {
                                onLocationSelect(location);
                            } else {
                                onLocationPreview(location);
                            }
                        },
                    }}
                    // @ts-ignore — custom prop for cluster icon logic
                    locationType={location.type}
                />
            );
        }),
        [visibleLocations, selectedLocation, customIcon, onLocationSelect, onLocationPreview]
    );

    const canvasRenderer = React.useMemo(
        () => L.canvas({ tolerance: isMobile ? 10 : 5, padding: 0.5 }),
        [isMobile]
    );

    // Zoom-dependent cluster radius: large at wide view, shrinks to near-zero at street level.
    // leaflet.markercluster natively accepts (zoom: number) => number for maxClusterRadius.
    const clusterRadius = React.useMemo(() => {
        const m = isMobile ? 0.75 : 1.0;
        return (zoom: number): number => {
            if (zoom <= 5)  return Math.round(90 * m);
            if (zoom <= 7)  return Math.round(70 * m);
            if (zoom <= 9)  return Math.round(55 * m);
            if (zoom <= 11) return Math.round(40 * m);
            if (zoom <= 13) return Math.round(25 * m);
            if (zoom <= 15) return Math.round(15 * m);
            return Math.round(10 * m);
        };
    }, [isMobile]);

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
                worldCopyJump={true}
                preferCanvas={isMobile}
                renderer={canvasRenderer}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20}
                    maxNativeZoom={20}
                />
                <MapClickCloser onClose={onClosePreview} />
                <PositionTracker
                    location={previewLocation}
                    onPositionUpdate={handlePositionUpdate}
                />
                <ChangeView zoomLocations={zoomLocations ?? locations} leftPanelWidth={leftPanelWidth} />
                <LocationFlyTo location={flyToLocation ?? null} rightPanelWidth={rightPanelWidth} onComplete={onFlyToComplete ?? (() => {})} />
                <PreviewPanner location={previewLocation} />
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
                    // @ts-ignore — leaflet.markercluster accepts function form, but @types/leaflet types it as number
                    maxClusterRadius={clusterRadius}
                    spiderfyOnMaxZoom={false}
                    showCoverageOnHover={false}
                    zoomToBoundsOnClick={true}
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
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

export default Map;
