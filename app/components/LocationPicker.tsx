'use client'

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '../styles/locationPicker.module.css';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, locationName: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat = 0, initialLng = 0 }: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    // Small delay to ensure container is rendered
    const timer = setTimeout(() => {
      if (!mapContainer.current) return;

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [initialLng, initialLat],
          zoom: 1.5,
          projection: 'globe' as any,
        });

        // Change cursor to pointer to indicate clickability
        if (mapContainer.current) {
          mapContainer.current.style.cursor = 'crosshair';
        }

        // Add mousemove handler to show coordinates
        map.current.on('mousemove', (e: mapboxgl.MapMouseEvent) => {
          const { lng, lat } = e.lngLat;
          setHoverCoords({ lat, lng });
        });

        map.current.on('mouseleave', () => {
          setHoverCoords(null);
        });

        map.current.on('load', () => {
          if (map.current) {
            map.current.resize();
            setIsLoading(false);
          }
        });

        map.current.on('style.load', () => {
          if (map.current) {
            map.current.setFog({
              color: 'rgb(186, 210, 235)',
              'high-color': 'rgb(36, 92, 223)',
              'horizon-blend': 0.02,
              'space-color': 'rgb(11, 11, 25)',
              'star-intensity': 0.6,
            });
          }
        });

        // Add click handler
        map.current.on('click', async (e: mapboxgl.MapMouseEvent) => {
          const { lng, lat } = e.lngLat;

          // Remove existing marker
          if (marker.current) {
            marker.current.remove();
          }

          // Create custom marker element
          const el = document.createElement('div');
          el.className = styles.customMarker;
          el.innerHTML = `
            <div class="${styles.markerPin}">
              <div class="${styles.markerPinInner}">📍</div>
            </div>
            <div class="${styles.markerPulse}"></div>
          `;

          // Add new marker with custom element
          marker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          // Reverse geocode to get location name
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();
            const locationName = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            
            setSelectedLocation({ lat, lng, name: locationName });
            onLocationSelect(lat, lng, locationName);
          } catch (error) {
            const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setSelectedLocation({ lat, lng, name: locationName });
            onLocationSelect(lat, lng, locationName);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLat, initialLng, onLocationSelect]);

  // Search for locations
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Get user's current location
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Create custom marker element
        const el = document.createElement('div');
        el.className = styles.customMarker;
        el.innerHTML = `
          <div class="${styles.markerPin}">
            <div class="${styles.markerPinInner}">📍</div>
          </div>
          <div class="${styles.markerPulse}"></div>
        `;

        // Add new marker
        marker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map.current!);

        // Fly to location
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 12,
          duration: 2000,
        });

        // Get location name
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
          );
          const data = await response.json();
          const locationName = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          setSelectedLocation({ lat, lng, name: locationName });
          onLocationSelect(lat, lng, locationName);
        } catch (error) {
          const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setSelectedLocation({ lat, lng, name: locationName });
          onLocationSelect(lat, lng, locationName);
        }

        setGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please search or click on the map.');
        setGettingLocation(false);
      }
    );
  };

  // Select a location from search results
  const selectSearchResult = (result: any) => {
    const [lng, lat] = result.center;
    const locationName = result.place_name;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Create custom marker element
    const el = document.createElement('div');
    el.className = styles.customMarker;
    el.innerHTML = `
      <div class="${styles.markerPin}">
        <div class="${styles.markerPinInner}">📍</div>
      </div>
      <div class="${styles.markerPulse}"></div>
    `;

    // Add new marker
    marker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(map.current!);

    // Fly to location
    map.current?.flyTo({
      center: [lng, lat],
      zoom: 12,
      duration: 2000,
    });

    setSelectedLocation({ lat, lng, name: locationName });
    onLocationSelect(lat, lng, locationName);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.instructions}>
        🌍 Search for a location or click anywhere on the map
      </div>

      {/* Search Box */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBoxWrapper}>
          <div className={styles.searchBox}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a city, landmark, or address..."
              className={styles.searchInput}
            />
            {isSearching && <div className={styles.searchSpinner}>🔍</div>}
          </div>
          <button
            onClick={useMyLocation}
            disabled={gettingLocation}
            className={styles.myLocationButton}
            title="Use my current location"
          >
            {gettingLocation ? '⏳' : '📍'}
          </button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className={styles.searchResults}>
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => selectSearchResult(result)}
                className={styles.searchResultItem}
              >
                <span className={styles.resultIcon}>📍</span>
                <div className={styles.resultText}>
                  <div className={styles.resultName}>{result.text}</div>
                  <div className={styles.resultPlace}>{result.place_name}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.mapWrapper}>
        <div ref={mapContainer} className={styles.map}>
          {isLoading && (
            <div className={styles.loading}>
              Loading map...
            </div>
          )}
        </div>
        {hoverCoords && !selectedLocation && (
          <div className={styles.hoverTooltip}>
            📍 {hoverCoords.lat.toFixed(4)}, {hoverCoords.lng.toFixed(4)}
          </div>
        )}
      </div>
      {selectedLocation && (
        <div className={styles.selectedLocation}>
          <strong>✓ Selected:</strong> {selectedLocation.name}
          <div className={styles.coordinates}>
            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
