'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getAllPublishedPages } from '../actions/pages';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PublishedPage {
  id: string;
  title: string;
  site_name: string | null;
  slug: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  header_image: string | null;
  published_at: string;
  creator_email: string | null;
}

interface MapboxGlobeProps {
  onHeaderClick?: () => void;
}

export default function MapboxGlobe({ onHeaderClick }: MapboxGlobeProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popups = useRef<mapboxgl.Popup[]>([]);
  
  const [publishedPages, setPublishedPages] = useState<PublishedPage[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Zoom functions
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  // Fetch published pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoading(true);
        const result = await getAllPublishedPages();
        if (result.pages) {
          // Validate and filter pages with valid coordinates
          const validPages = result.pages.filter(page => 
            page.latitude && 
            page.longitude && 
            !isNaN(page.latitude) && 
            !isNaN(page.longitude) &&
            page.latitude >= -90 && 
            page.latitude <= 90 &&
            page.longitude >= -180 && 
            page.longitude <= 180
          );
          setPublishedPages(validPages);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPages();
  }, []);

  // Initialize map once
  useEffect(() => {
    if (map.current) return;
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    if (!mapboxgl.accessToken) {
      setMapError('Mapbox token not found');
      return;
    }

    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: { name: 'globe' },
          zoom: 1.5,
          center: [0, 20]
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setMapError('Failed to load map');
        });

      map.current.on('style.load', () => {
        if (map.current) {
          map.current.setFog({
            color: 'rgb(186, 210, 235)',
            'high-color': 'rgb(36, 92, 223)',
            'horizon-blend': 0.02,
            'space-color': 'rgb(11, 11, 25)',
            'star-intensity': 0.6
          });
        }
      });

      // Add slow rotation
      let userInteracting = false;
      const rotateCamera = (timestamp: number) => {
        if (!map.current || userInteracting) return;
        
        const center = map.current.getCenter();
        center.lng -= 0.5; // Adjust speed (negative = west, positive = east)
        map.current.easeTo({ center, duration: 1000, easing: (t) => t });
      };

      map.current.on('mousedown', () => { userInteracting = true; });
      map.current.on('mouseup', () => { userInteracting = false; });
      map.current.on('dragstart', () => { userInteracting = true; });
      map.current.on('dragend', () => { userInteracting = false; });
      map.current.on('touchstart', () => { userInteracting = true; });
      map.current.on('touchend', () => { userInteracting = false; });

      const rotationInterval = setInterval(rotateCamera, 1000);
      
      // Store interval for cleanup
      (map.current as any)._rotationInterval = rotationInterval;


      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize map');
      }
    }

    return () => {
      // Clean up rotation interval
      if (map.current && (map.current as any)._rotationInterval) {
        clearInterval((map.current as any)._rotationInterval);
      }
      
      // Clean up popups
      popups.current.forEach(popup => popup.remove());
      popups.current = [];
      
      // Clean up markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Clean up map
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add published pages markers when they're loaded
  useEffect(() => {
    if (!map.current || publishedPages.length === 0 || isLoading) return;

    // Clear existing markers and popups
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    popups.current.forEach(popup => popup.remove());
    popups.current = [];

    // Wait for map to be loaded
    const addMarkers = () => {
      if (!map.current) return;

      publishedPages.forEach((page, index) => {
        try {
          // Validate coordinates one more time
          const lng = Number(page.longitude);
          const lat = Number(page.latitude);
          
          if (isNaN(lng) || isNaN(lat)) {
            console.warn(`Invalid coordinates for page: ${page.title}`);
            return;
          }

          // Create marker element
          const el = document.createElement('div');
          el.className = 'published-page-marker';
          el.style.width = '40px';
          el.style.height = '40px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
          el.style.transition = 'transform 0.2s';
          el.style.animationDelay = `${index * 0.1}s`;
          el.style.transformOrigin = 'center center';
          el.style.overflow = 'hidden';
          el.setAttribute('data-page-id', page.id);
          el.setAttribute('aria-label', page.title);

          // If header image exists, use it as background
          if (page.header_image) {
            el.style.backgroundImage = `url(${page.header_image})`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
          } else {
            el.style.backgroundColor = '#667eea';
          }

          // Create marker with proper anchor
          const marker = new mapboxgl.Marker({ 
            element: el,
            anchor: 'center'
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          // Create popup
          const popup = new mapboxgl.Popup({ 
            offset: 35,
            closeButton: false,
            closeOnClick: false,
            maxWidth: '260px',
            className: 'page-marker-popup',
          })
          .setLngLat([lng, lat])
          .setHTML(`
            <div style="position: relative; width: 100%; height: 160px; overflow: hidden; border-radius: 0.25rem;">
              ${page.header_image ? `
                <img src="${page.header_image}" alt="${escapeHtml(page.title)}" 
                     style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              ` : `
                <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
              `}
              <div style="position: absolute; bottom: 0; left: 0; right: 0; 
                          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 50%, transparent 100%);
                          padding: 1.5rem 0.5rem 0.5rem 0.5rem;">
                <strong style="color: white; font-size: 0.875rem; display: block; margin-bottom: 0.25rem; 
                               text-shadow: 0 1px 3px rgba(0,0,0,0.5);">
                  ${escapeHtml(page.site_name || page.title)}
                </strong>
                ${page.creator_email ? `
                  <div style="font-size: 0.7rem; color: rgba(255,255,255,0.8); margin-bottom: 0.25rem;
                              text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                    by ${escapeHtml(page.creator_email)}
                  </div>
                ` : ''}
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.9); 
                            text-shadow: 0 1px 2px rgba(0,0,0,0.5);">
                  📍 ${escapeHtml(page.location_name || 'Unknown location')}
                </div>
              </div>
            </div>
          `);

          // Hover handlers
          el.addEventListener('mouseenter', () => {
            el.style.zIndex = '1000';
            popup.addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            el.style.zIndex = '';
            popup.remove();
          });

          // Click handler
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `/${page.slug}`;
          });

          markers.current.push(marker);
          popups.current.push(popup);
        } catch (error) {
          console.error(`Error creating marker for page: ${page.title}`, error);
        }
      });
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.once('load', addMarkers);
    }
  }, [publishedPages, isLoading]);

  // Ghost animation effect - rotating around the globe
  useEffect(() => {
    const createGhost = () => {
      const ghost = document.createElement('img');
      ghost.src = '/ghost-flying.gif';
      ghost.style.position = 'fixed';
      ghost.style.width = '60px';
      ghost.style.height = 'auto';
      ghost.style.zIndex = '999';
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.7';
      
      document.body.appendChild(ghost);
      
      // Center of the screen (globe center)
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Orbit radius
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
      
      // Random starting angle
      const startAngle = Math.random() * Math.PI * 2;
      
      // Duration for one complete orbit
      const duration = 20000 + Math.random() * 10000; // 20-30 seconds
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
          ghost.remove();
          return;
        }
        
        // Calculate angle (full rotation)
        const angle = startAngle + (progress * Math.PI * 2);
        
        // Calculate position on circular path
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Add some floating motion
        const float = Math.sin(progress * Math.PI * 8) * 15;
        
        ghost.style.left = `${x}px`;
        ghost.style.top = `${y + float}px`;
        
        // Rotate ghost to face the direction of movement
        const rotationAngle = angle * (180 / Math.PI) + 90;
        ghost.style.transform = `rotate(${rotationAngle}deg)`;
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
    
    // Create ghosts periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.2) { // 80% chance
        createGhost();
      }
    }, 6000); // Every 6 seconds
    
    // Create first ghost after a short delay
    const timeout = setTimeout(createGhost, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Helper function to escape HTML
  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return (
    <div className="flex h-screen">
      <div 
        ref={mapContainer} 
        className="flex-1"
        style={{ position: 'relative' }}
      >
        {mapError && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
          }}>
            <p style={{ color: '#dc2626', fontWeight: 'bold' }}>Error loading map</p>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{mapError}</p>
          </div>
        )}
        {isLoading && !mapError && (
          <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '2rem',
            fontSize: '0.875rem',
            zIndex: 1000,
          }}>
            Loading published pages...
          </div>
        )}
        {!isLoading && (
          <div 
            onClick={onHeaderClick}
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '0.25rem',
              padding: '0.75rem 1rem',
              zIndex: 1000,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: onHeaderClick ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (onHeaderClick) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
            onMouseLeave={(e) => {
              if (onHeaderClick) {
                e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <img 
              src="/ghost-flying.gif" 
              alt="Ghost" 
              style={{
                width: '40px',
                height: 'auto',
                filter: 'drop-shadow(0 0 12px rgba(139, 0, 139, 0.6))',
                animation: 'float 3s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '200',
                color: '#ffffff',
                letterSpacing: '0.1em',
                textTransform: 'lowercase',
                marginBottom: '0.25rem',
              }}>
                geo spirits
              </div>
              {publishedPages.length > 0 && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '200',
                  color: '#666',
                  letterSpacing: '0.05em',
                  textTransform: 'lowercase',
                }}>
                  {publishedPages.length} {publishedPages.length === 1 ? 'page' : 'pages'} published
                </div>
              )}
            </div>
          </div>
        )}
        {/* Zoom Controls */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 1000,
        }}>
          <button
            onClick={handleZoomIn}
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.25rem',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#888',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
              e.currentTarget.style.color = '#888';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              background: 'rgba(20, 20, 20, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.25rem',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#888',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)';
              e.currentTarget.style.color = '#888';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
