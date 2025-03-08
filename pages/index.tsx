import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Location, Episode } from '../types/Location';
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
  episodes: Set<string>;
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

    locationData.locations.forEach((location) => {
      const { playlistId, playlistTitle, youtubeTitle } = location.episode;
      
      if (!playlistMap[playlistId]) {
        playlistMap[playlistId] = {
          id: playlistId,
          title: playlistTitle,
          episodes: new Set(),
          locations: [],
        };
      }

      playlistMap[playlistId].episodes.add(youtubeTitle);
      playlistMap[playlistId].locations.push(location);
    });

    return Object.values(playlistMap).sort((a, b) => a.title.localeCompare(b.title));
  }, [locationData.locations]);

  // Filter locations based on selection
  const filteredLocations = useMemo(() => {
    if (!selectedPlaylist && !selectedEpisode) {
      return locationData.locations;
    }

    return locationData.locations.filter((location) => {
      if (selectedEpisode) {
        return location.episode.youtubeTitle === selectedEpisode;
      }
      return location.episode.playlistId === selectedPlaylist;
    });
  }, [locationData.locations, selectedPlaylist, selectedEpisode]);

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

  const handleEpisodeClick = (episodeTitle: string) => {
    setSelectedEpisode(episodeTitle);
  };

  const handleLocationSelect = (location: Location | null) => {
    if (selectedLocation?.id === location?.id) {
      setSelectedLocation(null);
    } else {
      setSelectedLocation(location);
    }
  };

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
                  🌍 Wszystkie lokacje ({locationData.locations.length})
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
                                  {Array.from(playlist.episodes).length} odcinków
                                </span>
                              </div>
                            )}
                            {Array.from(playlist.episodes).map((episodeTitle) => (
                              <button
                                key={episodeTitle}
                                onClick={() => handleEpisodeClick(episodeTitle)}
                                className={`block w-full text-left text-sm ${
                                  selectedEpisode === episodeTitle ? 'text-blue-600' : 'text-gray-600'
                                } hover:text-blue-600`}
                              >
                                {episodeTitle}
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
            <div className="h-full p-6 overflow-y-auto relative">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-primary pr-8">{selectedLocation.name}</h2>
                <button 
                  onClick={() => handleLocationSelect(null)}
                  className="text-primary-hover hover:text-primary text-2xl leading-none absolute top-4 right-4"
                >
                  ×
                </button>
              </div>
              <p className="text-primary-hover mb-6">{selectedLocation.description}</p>
              <div className="text-sm text-primary-hover space-y-3">
                <p>📍 {selectedLocation.address}</p>
                <p>🌍 {selectedLocation.country}</p>
                <p>🎥 {selectedLocation.episode.show}</p>
                <p>📅 {selectedLocation.episode.title} ({selectedLocation.episode.date})</p>
                <div className="mt-6 space-y-4">
                  {selectedLocation.websiteUrl && (
                    <a 
                      href={selectedLocation.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover block transition-colors"
                    >
                      🍽️ Odwiedź stronę restauracji →
                    </a>
                  )}
                  {selectedLocation.episode.youtubeUrl && (
                    <a 
                      href={selectedLocation.episode.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover block transition-colors"
                    >
                      📺 {selectedLocation.episode.youtubeTitle} (YT)
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 