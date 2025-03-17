import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Location, LocationType } from '../types/Location';
import locationData from '../data/locations.json';
import { Header } from '../components/layout/Header';
import { Filters } from '../components/filters/Filters';
import { LocationDetails } from '../components/location/LocationDetails';

// Import Map component dynamically to avoid SSR issues
const Map = dynamic(() => import('../components/map/Map'), {
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and organize data by countries and videos
  const countries = useMemo(() => {
    const countryMap: Record<string, CountryData> = {};
    const query = searchQuery.toLowerCase().trim();

    locationData.videos.forEach((video) => {
      const videoMatches = !query || video.title.toLowerCase().includes(query);

      // Filter locations that match the search query
      const matchingLocations = video.locations.filter((loc) => {
        const location = {
          ...loc,
          type: validateLocationType(loc.type)
        };

        return !query || 
          location.name.toLowerCase().includes(query) ||
          location.country.toLowerCase().includes(query) ||
          location.description.toLowerCase().includes(query) ||
          location.address.toLowerCase().includes(query) ||
          videoMatches; // Include all locations if video title matches
      });

      // Process only matching locations
      matchingLocations.forEach((loc) => {
        const location = {
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

        // Add video with only matching locations
        const existingVideo = countryMap[location.country].videos.find(v => v.videoId === video.videoId);
        if (!existingVideo) {
          countryMap[location.country].videos.push({
            videoId: video.videoId,
            title: video.title,
            date: video.date,
            show: video.show,
            locations: matchingLocations
              .filter(l => l.country === location.country)
              .map(l => ({ ...l, type: validateLocationType(l.type) })),
          });
        }
      });
    });

    // Remove empty countries
    Object.keys(countryMap).forEach(key => {
      if (countryMap[key].locations.length === 0) {
        delete countryMap[key];
      }
    });

    return Object.values(countryMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [locationData.videos, searchQuery]);

  // Filter locations based on selection
  const filteredLocations = useMemo(() => {
    if (selectedVideo) {
      const video = locationData.videos.find(v => v.videoId === selectedVideo);
      return video ? video.locations.map(l => ({ 
        ...l, 
        type: validateLocationType(l.type),
        videoId: video.videoId
      })) : [];
    }

    if (selectedCountry) {
      const countryLocations = countries.find(c => c.name === selectedCountry)?.locations || [];
      return countryLocations.map(l => ({ 
        ...l, 
        type: validateLocationType(l.type),
        videoId: locationData.videos.find(v => 
          v.locations.some(loc => loc.id === l.id)
        )?.videoId
      }));
    }

    return locationData.videos.flatMap(video => 
      video.locations.map(l => ({ 
        ...l, 
        type: validateLocationType(l.type),
        videoId: video.videoId
      }))
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
      <Header />

      <div className="flex flex-1 relative">
        <Filters
          isOpen={isFiltersOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          countries={countries}
          selectedCountry={selectedCountry}
          selectedVideo={selectedVideo}
          selectedLocation={selectedLocation}
          expandedCountries={expandedCountries}
          expandedVideos={expandedVideos}
          totalLocations={totalLocations}
          onCountryClick={handleCountryClick}
          onVideoClick={handleVideoClick}
          onLocationClick={handleLocationClick}
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)}
          onResetFilters={() => {
            setSelectedCountry(null);
            setSelectedVideo(null);
          }}
        />

        <div className="flex-1">
          <Map 
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationClick}
          />
        </div>

        <LocationDetails
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      </div>
    </main>
  );
} 