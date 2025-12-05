# Implementation Plan

- [x] 1. Prepare location images and assets
  - Download or create sample images for diverse global locations (New York, Rio, Paris, Tokyo, Cairo, Sydney, etc.)
  - Optimize images for web (resize to appropriate dimensions, compress)
  - Save images to `mapbox-globe/public/locations/` directory with descriptive names
  - _Requirements: 1.2, 4.1, 4.2_

- [x] 2. Create marker data structure and sample data
  - Define TypeScript interface for MarkerData with id, coordinates, imageUrl, name, description, headerImageUrl, and siteUrl fields
  - Create SAMPLE_MARKERS constant array with 10-12 diverse locations across continents
  - Include description text and external site URLs for each location
  - Ensure geographic diversity: include locations from different continents and hemispheres
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.2, 5.3, 5.4_

- [x] 3. Implement marker validation utilities
  - Create validation function to check coordinate ranges (lat: -90 to 90, lon: -180 to 180)
  - Create validation function to verify required fields in marker data
  - Add error logging for invalid marker data
  - _Requirements: 3.4, 3.5_

- [x] 4. Create marker styling
  - Create CSS module or styled component for circular marker containers
  - Style markers with circular shape, border, and shadow effects
  - Style images to fit within circular boundary using object-fit: cover
  - Add fallback styling for failed image loads
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4_

- [x] 5. Implement marker creation function
  - Create function that generates HTML marker elements from MarkerData
  - Apply circular styling to marker containers
  - Add image elements with proper src and alt attributes
  - Add click event handlers to markers that trigger side panel opening
  - Implement error handling for image load failures
  - Return Mapbox Marker instances positioned at correct coordinates
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.1_

- [x] 6. Integrate markers into MapboxGlobe component
  - Add ref to store marker instances for cleanup
  - Add state to manage side panel visibility and selected location
  - Create markers after map initialization in useEffect
  - Add markers to the map using Mapbox marker API
  - Implement cleanup logic to remove markers on unmount
  - _Requirements: 1.1, 1.3, 1.4, 5.1_

- [x] 6.1 Write property test for marker positioning
  - **Property 1: Marker positioning correctness**
  - **Validates: Requirements 1.1, 1.3, 1.4**

- [x] 7. Create side panel component
  - Create new React component for location details panel
  - Implement slide-in animation from right side
  - Display header image, location name, description, and visit button
  - Add close button in panel header
  - Style panel to be responsive for mobile and desktop
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 8. Implement side panel interaction logic
  - Add click-outside-to-close functionality using event listeners
  - Implement close button handler
  - Handle marker click to open/update panel with selected location data
  - Ensure panel updates when different marker is clicked while open
  - _Requirements: 5.1, 5.5, 5.6_

