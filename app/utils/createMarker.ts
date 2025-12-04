import mapboxgl from 'mapbox-gl';
import { MarkerData } from '../types/marker';
import styles from '../styles/marker.module.css';

/**
 * Creates a custom HTML marker element with circular styling
 */
function createMarkerElement(markerData: MarkerData, onClick?: () => void): HTMLDivElement {
  const container = document.createElement('div');
  container.className = styles.markerContainer;
  container.setAttribute('aria-label', markerData.name);
  container.style.cursor = 'pointer';
  
  // Add click handler if provided
  if (onClick) {
    container.addEventListener('click', onClick);
  }
  
  const img = document.createElement('img');
  img.src = markerData.imageUrl;
  img.alt = markerData.name;
  img.className = styles.markerImage;
  
  // Handle image load errors with fallback
  img.onerror = () => {
    img.className = `${styles.markerImage} ${styles.error}`;
    
    const fallback = document.createElement('div');
    fallback.className = styles.markerFallback;
    fallback.textContent = markerData.name.charAt(0).toUpperCase();
    
    container.appendChild(fallback);
  };
  
  container.appendChild(img);
  
  return container;
}

/**
 * Creates a Mapbox marker instance from marker data
 */
export function createMarker(markerData: MarkerData, onClick?: () => void): mapboxgl.Marker {
  const element = createMarkerElement(markerData, onClick);
  
  const marker = new mapboxgl.Marker({
    element,
    anchor: 'center'
  }).setLngLat(markerData.coordinates);
  
  return marker;
}

/**
 * Creates multiple markers from an array of marker data
 */
export function createMarkers(
  markersData: MarkerData[], 
  onMarkerClick?: (markerData: MarkerData) => void
): mapboxgl.Marker[] {
  return markersData.map(markerData => 
    createMarker(markerData, onMarkerClick ? () => onMarkerClick(markerData) : undefined)
  );
}
