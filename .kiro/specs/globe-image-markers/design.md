# Design Document: Globe Image Markers

## Overview

This feature extends the existing Mapbox globe visualization by adding circular image markers at various locations worldwide. The implementation uses Mapbox GL JS's marker API to create custom HTML markers that display location images within circular containers. The markers will be positioned at specific geographic coordinates and will maintain their positions as users interact with the globe.

## Architecture

The solution follows a component-based architecture within the existing Next.js application:

1. **Marker Data Layer**: A TypeScript data structure defining marker locations, images, descriptions, and external URLs
2. **Marker Component**: A React component or HTML element factory that creates circular image markers with click handlers
3. **Side Panel Component**: A React component that displays location details including header image, description, and visit button
4. **Globe Integration**: Extension of the existing MapboxGlobe component to instantiate and manage markers and side panel state
5. **Asset Management**: Storage and organization of location images in the public directory

The implementation will integrate the side panel component with the MapboxGlobe component, using React state to manage panel visibility and selected location data.

## Components and Interfaces

### Marker Data Structure

```typescript
interface MarkerData {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  imageUrl: string;
  name: string;
  description: string;
  headerImageUrl: string;
  siteUrl: string;
}
```

### Marker Configuration

A constant array of MarkerData objects will define the sample markers:

```typescript
const SAMPLE_MARKERS: MarkerData[] = [
  // Markers distributed across continents
];
```

### Marker Creation

Markers will be created using Mapbox GL JS's custom marker functionality:

- Custom HTML elements styled as circular containers
- CSS styling for circular shape, image fitting, and visual effects
- Mapbox Marker instances positioned at geographic coordinates

### Component Integration

The MapboxGlobe component will be extended to:
- Store marker instances in a ref for lifecycle management
- Create markers with click event handlers after the map initializes
- Manage side panel state (open/closed, selected location)
- Clean up markers when the component unmounts

### Side Panel Component

A new React component will be created to display location details:
- Conditionally rendered based on state
- Slides in from the right side of the screen
- Contains header image, location name, description, and visit button
- Includes close button and click-outside-to-close functionality
- Responsive design for mobile and desktop viewports

## Data Models

### MarkerData Interface

- `id`: Unique identifier for the marker (string)
- `coordinates`: Tuple of [longitude, latitude] (number[])
- `imageUrl`: Path to the location image (string)
- `name`: Human-readable location name (string)
- `description`: Text description of the location (string)
- `headerImageUrl`: Path to the header image for the side panel (string)
- `siteUrl`: External URL for the "Visit Site" button (string)

### Sample Locations

The implementation will include markers for diverse global locations:
- North America: New York City, Grand Canyon
- South America: Rio de Janeiro, Machu Picchu
- Europe: Paris, Rome
- Asia: Tokyo, Taj Mahal
- Africa: Cairo, Cape Town
- Oceania: Sydney

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Marker positioning correctness

*For any* set of marker data with valid geographic coordinates, when markers are created on the globe, each marker should be positioned at its specified coordinates and maintain that position during map interactions.

**Validates: Requirements 1.1, 1.3, 1.4**

### Property 2: Marker structure completeness

*For any* marker created from marker data, the marker's DOM structure should contain both a circular container element and an image element.

**Validates: Requirements 1.2**

### Property 3: Consistent marker styling

*For any* set of markers displayed on the globe, all markers should have identical dimensions and consistent CSS styling applied.

**Validates: Requirements 2.1, 2.4**

### Property 4: Image containment within circular boundary

*For any* marker with a loaded image, the image should be styled to fit within the circular boundary without overflowing.

**Validates: Requirements 2.2**

### Property 5: Data structure processing

*For any* valid marker data object, the system should successfully extract and use the coordinates and image URL fields to create a marker.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 6: Coordinate validation

*For any* marker data, if the latitude is outside the range [-90, 90] or longitude is outside the range [-180, 180], the system should reject or handle the invalid coordinates appropriately.

**Validates: Requirements 3.4**

### Property 7: Marker click opens side panel

*For any* marker with valid location data, when the marker is clicked, the side panel should open and display the location details for that marker.

**Validates: Requirements 5.1**

### Property 8: Side panel displays header image

*For any* location data with a header image URL, when the side panel opens for that location, the rendered panel should contain an image element with the correct source URL.

**Validates: Requirements 5.2**

### Property 9: Side panel displays description

*For any* location data with a description, when the side panel opens for that location, the rendered panel should contain the description text.

**Validates: Requirements 5.3**

### Property 10: Side panel displays visit button

*For any* location data with a site URL, when the side panel opens for that location, the rendered panel should contain a "Visit Site" button with an href attribute matching the site URL.

**Validates: Requirements 5.4**

### Property 11: Side panel closes on outside click

*For any* open side panel, when a click event occurs outside the panel boundaries or on the close button, the side panel should close.

**Validates: Requirements 5.5**

### Property 12: Side panel updates on marker switch

*For any* two different markers, when the side panel is open showing the first marker's details and the second marker is clicked, the side panel should update to display the second marker's details.

**Validates: Requirements 5.6**

## Error Handling

### Image Loading Failures

When a location image fails to load:
- Display a fallback background color or placeholder icon
- Use CSS `onerror` handling or React error boundaries
- Log errors for debugging purposes
- Maintain marker visibility with fallback styling

### Invalid Coordinate Data

When marker data contains invalid coordinates:
- Validate coordinates before creating markers
- Log validation errors with details about which marker failed
- Skip invalid markers rather than breaking the entire component
- Provide clear error messages for developers

### Map Initialization Failures

If the Mapbox map fails to initialize:
- Existing error handling in MapboxGlobe component will prevent marker creation
- Markers should only be created after successful map initialization
- Component should gracefully handle missing access tokens

## Testing Strategy

### Unit Testing

Unit tests will verify:
- Marker data validation functions correctly identify valid/invalid coordinates
- Marker data structure contains required fields
- Marker creation functions produce correct HTML structure
- CSS classes are applied correctly to marker elements

### Property-Based Testing

Property-based tests will be implemented using **fast-check** (for TypeScript/JavaScript). Each test will run a minimum of 100 iterations.

Property tests will verify:
- **Property 1**: Generate random valid coordinates and marker data, create markers, verify each marker is positioned at its specified coordinates
- **Property 2**: Generate random marker data, create markers, verify DOM structure contains circular container and image element
- **Property 3**: Generate random sets of marker data, create markers, verify all have identical dimensions
- **Property 4**: Generate random marker data with images, verify images are contained within circular boundaries
- **Property 5**: Generate random valid marker data objects, verify system extracts coordinates and image URLs correctly
- **Property 6**: Generate random coordinates including invalid ranges, verify system rejects coordinates outside valid ranges
- **Property 7**: Generate random marker data, simulate click events, verify side panel opens with correct location data
- **Property 8**: Generate random location data with header images, open side panel, verify header image is rendered with correct source
- **Property 9**: Generate random location data with descriptions, open side panel, verify description text is present
- **Property 10**: Generate random location data with site URLs, open side panel, verify visit button exists with correct href
- **Property 11**: Open side panel, simulate outside clicks and close button clicks, verify panel closes
- **Property 12**: Generate two random markers, open panel for first, click second, verify panel updates to show second marker's data

### Integration Testing

Integration tests will verify:
- Markers appear on the actual Mapbox globe after component mount
- Markers persist during map rotation and zoom operations
- Image loading and fallback behavior works correctly
- Multiple markers can coexist without conflicts

### Manual Testing

Manual verification will include:
- Visual inspection of marker appearance and positioning
- Testing marker visibility at different zoom levels
- Verifying image quality and circular cropping
- Checking performance with multiple markers

## Implementation Notes

### Technology Stack

- **Mapbox GL JS**: v2.x or v3.x marker API
- **React**: Hooks for lifecycle management (useEffect, useRef)
- **TypeScript**: Type safety for marker data structures
- **CSS**: Styling for circular markers and image containment
- **Next.js**: Public directory for image assets

### Marker Styling Approach

Use CSS to create circular markers:
```css
.marker-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.marker-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

### Performance Considerations

- Limit initial marker count to 10-15 for optimal performance
- Use appropriate image sizes (optimize images before deployment)
- Consider lazy loading for marker images if needed
- Clean up marker instances on component unmount to prevent memory leaks

### Accessibility

- Add aria-labels to markers with location names
- Ensure markers are keyboard accessible if interactive features are added later
- Provide alt text for location images

## Future Enhancements

Potential future improvements (out of scope for this feature):
- Interactive markers with click handlers showing location details
- Marker clustering for dense geographic regions
- Animated marker appearance
- Dynamic marker loading based on visible map bounds
- User-generated markers
- Marker filtering and search functionality
