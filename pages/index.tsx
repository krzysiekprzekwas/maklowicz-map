import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Location } from '../types/Location';
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

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  // Get unique episodes and sort them by date
  const episodes = useMemo(() => {
    const uniqueEpisodes = Array.from(
      new Set(locationData.locations.map(loc => loc.episode.youtubeTitle))
    ).filter(Boolean) as string[];
    
    return uniqueEpisodes.sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter locations based on selected episode
  const filteredLocations = useMemo(() => {
    if (!selectedEpisode) return locationData.locations;
    return locationData.locations.filter(
      loc => loc.episode.youtubeTitle === selectedEpisode
    );
  }, [selectedEpisode]);

  const handleLocationSelect = (location: Location | null) => {
    setSelectedLocation(location);
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
      <div className="flex flex-1">
        {/* Filters */}
        <div className="w-80 bg-white shadow-lg">
          <div className="p-4">
            {/* All Locations Button */}
            <button
              onClick={() => setSelectedEpisode(null)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-4 ${
                !selectedEpisode 
                  ? 'bg-secondary-darker text-primary' 
                  : 'hover:bg-secondary'
              }`}
            >
              🌍 Wszystkie lokacje ({locationData.locations.length})
            </button>

            {/* Episodes Section */}
            <div className="border border-secondary-border rounded-lg overflow-hidden">
              <div className="w-full flex items-center justify-between p-3 bg-secondary">
                <span className="font-bold text-primary">📺 Odcinki</span>
              </div>
              
              <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {episodes.map((episode) => (
                  <button
                    key={episode}
                    onClick={() => setSelectedEpisode(episode)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedEpisode === episode 
                        ? 'bg-secondary-darker text-primary' 
                        : 'hover:bg-secondary text-primary-hover'
                    }`}
                  >
                    {episode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[calc(100vh-116px)] z-[1]">
          <Map 
            locations={filteredLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
          />
        </div>

        {/* Location Details Drawer */}
        <div 
          className={`fixed top-[116px] right-0 h-[calc(100vh-116px)] w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[2] ${
            selectedLocation ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedLocation && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-primary pr-8">{selectedLocation.name}</h2>
                <button 
                  onClick={() => handleLocationSelect(null)}
                  className="text-primary-hover hover:text-primary text-2xl leading-none"
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