import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '../types/Location';

interface MapProps {
    locations: Location[];
    onLocationSelect?: (location: Location) => void;
}

const Map = ({ locations, onLocationSelect }: MapProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<{ [key: string]: { marker: mapboxgl.Marker, element: HTMLDivElement } }>({});
    const [error, setError] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    const updateMarkerColor = (element: HTMLDivElement, isSelected: boolean) => {
        element.style.backgroundColor = isSelected ? 'rgb(88, 202, 229)' : '#2c1810';
    };

    // Effect for handling marker color changes
    useEffect(() => {
        if (!selectedLocation) return;

        // Update all marker colors
        Object.entries(markersRef.current).forEach(([key, { element }]) => {
            const [lat, lng] = key.split(',');
            const isSelected = selectedLocation.latitude === parseFloat(lat) && 
                             selectedLocation.longitude === parseFloat(lng);
            updateMarkerColor(element, isSelected);
        });
    }, [selectedLocation]);

    useEffect(() => {
        if (!mapContainer.current) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
            setError('Mapbox token is missing');
            return;
        }

        // Initialize map if it hasn't been initialized yet
        if (!map.current) {
            try {
                mapboxgl.accessToken = token;
                console.log('Initializing map with token:', token);
                
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/light-v11', // Using light style as base
                    center: [19.9365800, 50.0614300], // Centered on Kraków
                    zoom: 4
                });

                map.current.on('load', () => {
                    console.log('Map loaded successfully');
                    
                    if (map.current) {
                        // Customize map colors to match website theme
                        map.current.setPaintProperty('water', 'fill-color', '#e6dfd7');
                        map.current.setPaintProperty('land', 'background-color', '#f8f5f0');
                        map.current.setPaintProperty('building', 'fill-color', '#6b4c40');
                        
                        // Make text labels brown
                        const layers = map.current.getStyle().layers;
                        layers?.forEach(layer => {
                            if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
                                map.current?.setPaintProperty(layer.id, 'text-color', '#2c1810');
                            }
                        });
                    }
                });

                map.current.on('error', (e) => {
                    console.error('Mapbox error:', e);
                    setError('Error loading map');
                });
            } catch (err) {
                console.error('Error initializing map:', err);
                setError('Error initializing map');
                return;
            }
        }

        // Clear existing markers
        Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
        markersRef.current = {};

        // Add new markers with custom style
        locations.forEach((location) => {
            try {
                // Create custom marker element
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.style.width = '24px';
                el.style.height = '24px';
                el.style.backgroundColor = '#2c1810'; // primary color
                el.style.border = '2px solid #f8f5f0'; // secondary color
                el.style.borderRadius = '50%';
                el.style.cursor = 'pointer';
                el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

                const marker = new mapboxgl.Marker(el)
                    .setLngLat([location.longitude, location.latitude])
                    .addTo(map.current!);

                marker.getElement().addEventListener('click', () => {
                    setSelectedLocation(location);
                    onLocationSelect?.(location);
                });

                // Store marker reference with its element
                markersRef.current[`${location.latitude},${location.longitude}`] = { marker, element: el };
            } catch (err) {
                console.error('Error adding marker:', err);
            }
        });

        // Fit map to show all markers
        if (locations.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            locations.forEach(location => {
                bounds.extend([location.longitude, location.latitude]);
            });
            map.current.fitBounds(bounds, { padding: 50 });
        }

        return () => {
            if (map.current) {
                Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
                markersRef.current = {};
                map.current.remove();
                map.current = null;
            }
        };
    }, [locations, onLocationSelect]);

    return (
        <div className="w-full h-full relative bg-secondary">
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-10">
                    {error}
                </div>
            )}
            <div 
                ref={mapContainer} 
                className="w-full h-full" 
                style={{ 
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0
                }}
            />
            <style jsx global>{`
                .custom-marker {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default Map; 