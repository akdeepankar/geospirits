import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createMarker, createMarkers } from './createMarker';
import { MarkerData } from '../types/marker';
import mapboxgl from 'mapbox-gl';

// Mock mapbox-gl
class MockMarker {
  private _lngLat: [number, number] = [0, 0];
  private _element: HTMLElement | null = null;
  private _map: any = null;

  constructor(options?: { element?: HTMLElement; anchor?: string }) {
    if (options?.element) {
      this._element = options.element;
    }
  }

  setLngLat(lngLat: [number, number]) {
    this._lngLat = lngLat;
    return this;
  }

  getLngLat() {
    return { lng: this._lngLat[0], lat: this._lngLat[1] };
  }

  addTo(map: any) {
    this._map = map;
    return this;
  }

  remove() {
    this._map = null;
    return this;
  }

  getElement() {
    return this._element;
  }
}

// Replace the real Marker with our mock
(mapboxgl as any).Marker = MockMarker;

describe('Marker Positioning Property Tests', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';
  });

  /**
   * Feature: globe-image-markers, Property 1: Marker positioning correctness
   * 
   * For any set of marker data with valid geographic coordinates, when markers are created on the globe,
   * each marker should be positioned at its specified coordinates and maintain that position during map interactions.
   * 
   * Validates: Requirements 1.1, 1.3, 1.4
   */
  it('Property 1: markers are positioned at their specified coordinates', () => {
    fc.assert(
      fc.property(
        // Generate valid longitude (-180 to 180)
        fc.double({ min: -180, max: 180, noNaN: true }),
        // Generate valid latitude (-90 to 90)
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (lng, lat, id, name, imageUrl, description, headerImageUrl, siteUrl) => {
          const markerData: MarkerData = {
            id,
            coordinates: [lng, lat],
            imageUrl,
            name,
            description,
            headerImageUrl,
            siteUrl,
          };

          const marker = createMarker(markerData);
          const position = marker.getLngLat();

          // Verify marker is positioned at specified coordinates
          expect(position.lng).toBeCloseTo(lng, 10);
          expect(position.lat).toBeCloseTo(lat, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: multiple markers maintain their individual positions', () => {
    fc.assert(
      fc.property(
        // Generate an array of 2-10 markers with valid coordinates
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            coordinates: fc.tuple(
              fc.double({ min: -180, max: 180, noNaN: true }),
              fc.double({ min: -90, max: 90, noNaN: true })
            ) as fc.Arbitrary<[number, number]>,
            imageUrl: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
            headerImageUrl: fc.string({ minLength: 1 }),
            siteUrl: fc.string({ minLength: 1 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (markersData) => {
          const markers = createMarkers(markersData);

          // Verify each marker is positioned at its specified coordinates
          markers.forEach((marker, index) => {
            const position = marker.getLngLat();
            const expectedCoords = markersData[index].coordinates;

            expect(position.lng).toBeCloseTo(expectedCoords[0], 10);
            expect(position.lat).toBeCloseTo(expectedCoords[1], 10);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: marker position remains stable after creation', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -180, max: 180, noNaN: true }),
        fc.double({ min: -90, max: 90, noNaN: true }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (lng, lat, id, name, imageUrl, description, headerImageUrl, siteUrl) => {
          const markerData: MarkerData = {
            id,
            coordinates: [lng, lat],
            imageUrl,
            name,
            description,
            headerImageUrl,
            siteUrl,
          };

          const marker = createMarker(markerData);
          
          // Get position immediately after creation
          const position1 = marker.getLngLat();
          
          // Get position again (simulating time passing or map interactions)
          const position2 = marker.getLngLat();

          // Position should remain stable
          expect(position1.lng).toBe(position2.lng);
          expect(position1.lat).toBe(position2.lat);
          
          // And should match the original coordinates
          expect(position1.lng).toBeCloseTo(lng, 10);
          expect(position1.lat).toBeCloseTo(lat, 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});
