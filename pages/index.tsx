import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Location, LocationData, LocationType } from '../types/Location';
import locationData from '../data/locations.json';

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-secondary">
      <div className="text-primary text-xl">Loading map...</div>
    </div>
  )
});

interface CountryData {
  name: string;
  locations: Location[];
  videos: {
    videoId: string;
    title: string;
    date: string;
    show: string;
    locations: Location[];
  }[];
}

// Add this helper function at the top level of the file, before the Home component
function validateLocationType(type: string): LocationType {
  if (type === 'restaurant' || type === 'attraction' || type === 'other') {
    return type;
  }
  console.warn(`Invalid location type: ${type}, defaulting to 'other'`);
  return 'other';
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());

  // Organize data by countries and videos
  const countries = useMemo(() => {
    const countryMap: Record<string, CountryData> = {};

    locationData.videos.forEach((video) => {
      video.locations.forEach((loc) => {
        // Validate and cast location type
        const location: Location = {
          ...loc,
          type: validateLocationType(loc.type)
        };

        if (!countryMap[location.country]) {
          countryMap[location.country] = {
            name: location.country,
            locations: [],
            videos: [],
          };
        }

        // Add location if not already added
        if (!countryMap[location.country].locations.some(l => l.id === location.id)) {
          countryMap[location.country].locations.push(location);
        }

        // Add video if not already added
        if (!countryMap[location.country].videos.some(v => v.videoId === video.videoId)) {
          countryMap[location.country].videos.push({
            videoId: video.videoId,
            title: video.title,
            date: video.date,
            show: video.show,
            locations: video.locations
              .filter(l => l.country === location.country)
              .map(l => ({ ...l, type: validateLocationType(l.type) })),
          });
        }
      });
    });

    return Object.values(countryMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [locationData.videos]);

  // Filter locations based on selection
  const filteredLocations = useMemo(() => {
    if (selectedVideo) {
      const video = locationData.videos.find(v => v.videoId === selectedVideo);
      return video ? video.locations.map(l => ({ ...l, type: validateLocationType(l.type) })) : [];
    }

    if (selectedCountry) {
      const countryLocations = countries.find(c => c.name === selectedCountry)?.locations || [];
      return countryLocations.map(l => ({ ...l, type: validateLocationType(l.type) }));
    }

    return locationData.videos.flatMap(video => 
      video.locations.map(l => ({ ...l, type: validateLocationType(l.type) }))
    );
  }, [locationData.videos, selectedCountry, selectedVideo, countries]);

  const handleCountryClick = (countryName: string) => {
    // Toggle expansion state
    setExpandedCountries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(countryName)) {
        newSet.delete(countryName);
      } else {
        newSet.add(countryName);
      }
      return newSet;
    });

    // Update selection and clear video selection
    setSelectedCountry(countryName === selectedCountry ? null : countryName);
    setSelectedVideo(null);
  };

  const handleVideoClick = (videoId: string, event: React.MouseEvent) => {
    // Prevent triggering parent's click handler
    event.stopPropagation();
    
    // Toggle expansion state
    setExpandedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
    setSelectedVideo(videoId === selectedVideo ? null : videoId);
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const totalLocations = useMemo(() => 
    locationData.videos.reduce((acc, video) => acc + video.locations.length, 0),
    [locationData.videos]
  );

  return (
    <main className="min-h-screen flex flex-col bg-secondary">
      {/* Header */}
      <header className="bg-primary text-secondary">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Śladami Roberta Makłowicza</h1>
            <p className="text-lg opacity-90">Interaktywna mapa restauracji i atrakcji odwiedzonych przez Roberta Makłowicza</p>
          </div>
          <nav>
            <ul className="flex space-x-6 items-center text-lg">
              <li>
                <Link 
                  href="/" 
                  className="text-secondary border-b-2 border-secondary"
                >
                  Mapa
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  O projekcie
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-secondary-darker transition-colors border-b-2 border-primary hover:border-secondary-darker"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Map and Filters Section */}
      <div className="flex flex-1 relative">
        {/* Filters */}
        <aside 
          className={`fixed top-[116px] bottom-0 left-0 transition-transform duration-300 ease-in-out transform ${
            isFiltersOpen ? 'translate-x-0' : '-translate-x-80'
          }`}
          style={{ zIndex: 9999 }}
        >
          <div className="relative h-full">
            {/* Filters Content */}
            <div className="w-80 h-full bg-white shadow-xl overflow-y-auto">
              <div className="p-4">
                {/* All Locations Button */}
                <button
                  onClick={() => {
                    setSelectedCountry(null);
                    setSelectedVideo(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-4 ${
                    !selectedCountry && !selectedVideo
                      ? 'bg-secondary-darker text-primary' 
                      : 'hover:bg-secondary text-primary-hover'
                  }`}
                >
                  🌍 Wszystkie lokacje ({totalLocations})
                </button>

                {/* Countries Section */}
                <div className="border border-secondary-border rounded-lg overflow-hidden">
                  <div className="w-full flex items-center justify-between p-3 bg-secondary">
                    <span className="font-bold text-primary">🗺️ Kraje</span>
                  </div>
                  
                  <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {countries.map((country) => (
                      <div key={country.name} className="space-y-1">
                        {/* Country Button */}
                        <button
                          onClick={() => handleCountryClick(country.name)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            selectedCountry === country.name
                              ? 'bg-secondary-darker text-primary' 
                              : 'hover:bg-secondary text-primary-hover'
                          }`}
                        >
                          <span className="flex-1 truncate pr-2">
                            {country.name}
                          </span>
                          <span className="text-xs opacity-70">
                            ({country.locations.length})
                          </span>
                          <span className="ml-2">
                            {expandedCountries.has(country.name) ? '▼' : '▶'}
                          </span>
                        </button>

                        {/* Videos Level */}
                        {expandedCountries.has(country.name) && (
                          <div className="ml-4 space-y-1">
                            {country.videos.map((video) => (
                              <div key={video.videoId} className="space-y-1">
                                {/* Video Button */}
                                <button
                                  onClick={(e) => handleVideoClick(video.videoId, e)}
                                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                                    selectedVideo === video.videoId
                                      ? 'bg-secondary-darker text-primary' 
                                      : 'hover:bg-secondary text-primary-hover'
                                  }`}
                                >
                                  <span className="flex-1 truncate pr-2 text-sm">
                                    {video.title}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    ({video.locations.length})
                                  </span>
                                  <span className="ml-2">
                                    {expandedVideos.has(video.videoId) ? '▼' : '▶'}
                                  </span>
                                </button>

                                {/* Locations Level */}
                                {expandedVideos.has(video.videoId) && (
                                  <div className="ml-4 space-y-1">
                                    {video.locations.map((location) => (
                                      <button
                                        key={location.id}
                                        onClick={(e) => handleLocationClick(location)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors flex items-center ${
                                          selectedLocation?.id === location.id
                                            ? 'bg-secondary-darker text-primary' 
                                            : 'hover:bg-secondary text-primary-hover'
                                        }`}
                                      >
                                        <span className="flex-1 truncate pr-2 text-sm">
                                          {location.name}
                                        </span>
                                        <span className="text-xs opacity-70">
                                          {location.type === 'restaurant' ? '🍴' : 
                                           location.type === 'attraction' ? '🏛️' : '📍'}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Ribbon */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="absolute top-4 -right-8 bg-white shadow-lg rounded-r-lg px-2 py-4 text-primary hover:text-primary-hover transition-colors"
            >
              {isFiltersOpen ? '◀' : '▶'}
            </button>
          </div>
        </aside>

        {/* Map */}
        <div className="flex-1 min-h-[calc(100vh-116px)]">
          <Map 
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationClick}
          />
        </div>

        {/* Location Details Drawer */}
        <aside 
          className={`fixed top-[116px] right-0 h-[calc(100vh-116px)] w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            selectedLocation ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ zIndex: 9999 }}
        >
          {selectedLocation && (
            <div className="p-6 relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Zamknij szczegóły"
              >
                <span className="text-gray-500 text-xl">×</span>
              </button>

              <h2 className="text-2xl font-bold mb-4 pr-8">{selectedLocation.name}</h2>
              <p className="text-gray-600 mb-4">{selectedLocation.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-1">Adres</h3>
                  <p>{selectedLocation.address}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Kraj</h3>
                  <p>{selectedLocation.country}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Typ miejsca</h3>
                  <p className="capitalize">{selectedLocation.type}</p>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
} 