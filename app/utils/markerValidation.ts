import { MarkerData } from '../types/marker';

/**
 * Validates that coordinates are within valid geographic ranges
 * Latitude: -90 to 90
 * Longitude: -180 to 180
 */
export function validateCoordinates(coordinates: [number, number]): boolean {
  const [longitude, latitude] = coordinates;
  
  if (latitude < -90 || latitude > 90) {
    console.error(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    return false;
  }
  
  if (longitude < -180 || longitude > 180) {
    console.error(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    return false;
  }
  
  return true;
}

/**
 * Validates that marker data contains all required fields
 */
export function validateMarkerData(marker: Partial<MarkerData>): marker is MarkerData {
  if (!marker.id) {
    console.error('Marker missing required field: id');
    return false;
  }
  
  if (!marker.name) {
    console.error(`Marker ${marker.id} missing required field: name`);
    return false;
  }
  
  if (!marker.imageUrl) {
    console.error(`Marker ${marker.id} missing required field: imageUrl`);
    return false;
  }
  
  if (!marker.coordinates || !Array.isArray(marker.coordinates) || marker.coordinates.length !== 2) {
    console.error(`Marker ${marker.id} missing or invalid coordinates`);
    return false;
  }
  
  if (!validateCoordinates(marker.coordinates)) {
    console.error(`Marker ${marker.id} has invalid coordinates`);
    return false;
  }
  
  return true;
}

/**
 * Filters an array of markers, returning only valid ones
 */
export function filterValidMarkers(markers: Partial<MarkerData>[]): MarkerData[] {
  return markers.filter(validateMarkerData);
}
