# Globe Marker Images Feature

## Overview

Globe markers now display the page's header image (if available) instead of a solid color circle. This makes it easier to visually identify pages on the globe.

## How It Works

### With Header Image:
```
Page has header_image → Marker shows image in circle
```
- Circular crop of header image
- Cover fit (fills circle)
- Centered positioning
- Subtle gradient overlay

### Without Header Image:
```
Page has no header_image → Marker shows blue circle
```
- Solid blue color (#667eea)
- Same as before
- Consistent fallback

## Visual Design

### Image Markers:
- **Shape:** Circle (40px diameter)
- **Border:** 3px white
- **Image:** Cover fit, centered
- **Overlay:** Subtle dark gradient at bottom
- **Shadow:** 0 2px 8px rgba(0,0,0,0.3)
- **Hover:** Scale 1.3x

### Plain Markers:
- **Shape:** Circle (40px diameter)
- **Color:** Blue (#667eea)
- **Border:** 3px white
- **Shadow:** Same as image markers
- **Hover:** Scale 1.3x

## Implementation

### Data Flow:
```
1. getAllPublishedPages() fetches header_image
2. MapboxGlobe receives pages with header_image
3. Marker creation checks if header_image exists
4. If yes: Set as background-image
5. If no: Use solid blue background
```

### Code:
```typescript
if (page.header_image) {
  el.style.backgroundImage = `url(${page.header_image})`;
  el.style.backgroundSize = 'cover';
  el.style.backgroundPosition = 'center';
} else {
  el.style.backgroundColor = '#667eea';
}
```

## Benefits

✅ **Visual Recognition** - Instantly identify pages by image
✅ **Better UX** - More engaging and informative
✅ **Consistent** - Works with or without images
✅ **Performance** - Images load asynchronously
✅ **Responsive** - Scales on hover like before

## Examples

### Travel Blog:
- Header Image: Eiffel Tower photo
- Marker: Shows Eiffel Tower in circle
- Easy to spot Paris-related content

### Recipe Page:
- Header Image: Food photo
- Marker: Shows food in circle
- Instantly recognizable as recipe

### Portfolio:
- Header Image: Design work
- Marker: Shows design preview
- Professional appearance

## Technical Details

### CSS Properties:
```css
.published-page-marker {
  background-image: url(...);
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  overflow: hidden;
}
```

### Gradient Overlay:
```css
.published-page-marker::after {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.3) 100%
  );
}
```

## Performance

- Images load asynchronously
- Browser caches images
- No impact on map performance
- Fallback to color if image fails

## Accessibility

- `aria-label` still includes page title
- Hover popup shows full information
- Color fallback ensures visibility
- High contrast white border

## Cluster Markers

Cluster markers (purple circles with numbers) remain unchanged:
- Show count of pages
- Click to zoom and expand
- No images (would be confusing)

## Migration

Existing pages without header images:
- Continue to work normally
- Show blue circle markers
- Can add header image anytime
- No breaking changes

## Tips

### Best Images for Markers:
- High contrast subjects
- Centered composition
- Clear focal point
- Recognizable at small size

### Avoid:
- Very light/white images (low contrast)
- Busy patterns (hard to see at small size)
- Text-heavy images (unreadable)
- Very dark images (blend with map)

## Future Enhancements

Possible additions:
- Custom marker shapes
- Marker size based on page views
- Animated markers
- Marker clustering with image preview
- Custom marker colors/themes

## Summary

Globe markers now intelligently display header images when available, making the globe more visually appealing and helping users quickly identify pages. The feature works seamlessly with the existing marker system and provides a graceful fallback for pages without images.
