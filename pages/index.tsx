import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Location, LocationData } from '../types/Location';
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

interface PlaylistData {
  id: string;
  title: string;
  episodes: {
    videoId: string;
    title: string;
    date: string;
    show: string;
    locations: Location[];
  }[];
  locations: Location[];
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(new Set());

  // Organize data by playlists and episodes
  const playlists = useMemo(() => {
    const playlistMap: Record<string, PlaylistData> = {};

    locationData.videos.forEach((video) => {
      const { playlistId, playlistTitle, videoId, title, date, show, locations } = video;
      
      if (!playlistMap[playlistId]) {
        playlistMap[playlistId] = {
          id: playlistId,
          title: playlistTitle,
          episodes: [],
          locations: [],
        };
      }

      playlistMap[playlistId].episodes.push({
        videoId,
        title,
        date,
        show,
        locations,
      });

      playlistMap[playlistId].locations.push(...locations);
    });

    return Object.values(playlistMap).sort((a, b) => a.title.localeCompare(b.title));
  }, [locationData.videos]);

  // Filter locations based on selection
  const filteredLocations = useMemo(() => {
    if (!selectedPlaylist && !selectedEpisode) {
      return locationData.videos.flatMap(video => video.locations);
    }

    const selectedVideo = locationData.videos.find(video => 
      selectedEpisode ? video.videoId === selectedEpisode : video.playlistId === selectedPlaylist
    );

    if (selectedVideo) {
      return selectedVideo.locations;
    }

    return locationData.videos
      .filter(video => video.playlistId === selectedPlaylist)
      .flatMap(video => video.locations);
  }, [locationData.videos, selectedPlaylist, selectedEpisode]);

  const handlePlaylistClick = (playlistId: string) => {
    setExpandedPlaylists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playlistId)) {
        newSet.delete(playlistId);
      } else {
        newSet.add(playlistId);
      }
      return newSet;
    });
    setSelectedPlaylist(playlistId);
    setSelectedEpisode(null);
  };

  const handleEpisodeClick = (videoId: string) => {
    setSelectedEpisode(videoId);
  };

  const handleLocationSelect = (location: Location | null) => {
    if (selectedLocation?.id === location?.id) {
      setSelectedLocation(null);
    } else {
      setSelectedLocation(location);
    }
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
        <div 
          className={`absolute top-0 bottom-0 left-0 transition-transform duration-300 ease-in-out transform ${
            isFiltersOpen ? 'translate-x-0' : '-translate-x-80'
          }`}
          style={{ zIndex: 2 }}
        >
          <div className="relative h-full">
            {/* Filters Content */}
            <div className="w-80 h-full bg-white shadow-lg">
              <div className="p-4">
                {/* All Locations Button */}
                <button
                  onClick={() => {
                    setSelectedPlaylist(null);
                    setSelectedEpisode(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-4 ${
                    !selectedPlaylist && !selectedEpisode
                      ? 'bg-secondary-darker text-primary' 
                      : 'hover:bg-secondary text-primary-hover'
                  }`}
                >
                  🌍 Wszystkie lokacje ({totalLocations})
                </button>

                {/* Playlists Section */}
                <div className="border border-secondary-border rounded-lg overflow-hidden">
                  <div className="w-full flex items-center justify-between p-3 bg-secondary">
                    <span className="font-bold text-primary">📺 Playlisty</span>
                  </div>
                  
                  <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {playlists.map((playlist) => (
                      <div key={playlist.id} className="space-y-1">
                        {/* Playlist Button */}
                        <button
                          onClick={() => handlePlaylistClick(playlist.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                            selectedPlaylist === playlist.id && !selectedEpisode
                              ? 'bg-secondary-darker text-primary' 
                              : 'hover:bg-secondary text-primary-hover'
                          }`}
                        >
                          <span className="flex-1 truncate pr-2">
                            {playlist.title}
                          </span>
                          <span className="text-xs opacity-70">
                            ({playlist.locations.length})
                          </span>
                          <span className="ml-2">
                            {expandedPlaylists.has(playlist.id) ? '▼' : '▶'}
                          </span>
                        </button>

                        {/* Episodes */}
                        {expandedPlaylists.has(playlist.id) && (
                          <div className="ml-4 space-y-2">
                            {playlist.locations.length > 0 && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  {playlist.locations.length} lokacji
                                </span>
                                <span className="text-sm text-gray-500">
                                  {playlist.episodes.length} odcinków
                                </span>
                              </div>
                            )}
                            {playlist.episodes.map((episode) => (
                              <button
                                key={episode.videoId}
                                onClick={() => handleEpisodeClick(episode.videoId)}
                                className={`block w-full text-left text-sm ${
                                  selectedEpisode === episode.videoId ? 'text-blue-600' : 'text-gray-600'
                                } hover:text-blue-600`}
                              >
                                {episode.title}
                              </button>
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
              aria-label={isFiltersOpen ? 'Zwiń filtry' : 'Rozwiń filtry'}
            >
              {isFiltersOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[calc(100vh-116px)]" style={{ zIndex: 1 }}>
          <Map 
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Location Details Drawer */}
        <div 
          className={`fixed top-[116px] right-0 h-[calc(100vh-116px)] w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            selectedLocation ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ zIndex: 2 }}
        >
          {selectedLocation && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedLocation.name}</h2>
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

                {selectedLocation.cuisine && (
                  <div>
                    <h3 className="font-semibold mb-1">Kuchnia</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLocation.cuisine.map((type) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-secondary text-primary rounded-full text-sm"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLocation.websiteUrl && (
                  <div>
                    <h3 className="font-semibold mb-1">Strona internetowa</h3>
                    <a
                      href={selectedLocation.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedLocation.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 