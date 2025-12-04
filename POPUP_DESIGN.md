# Globe Marker Popup Design

## Overview

Hover popups on globe markers now display header images when available, providing a richer preview of the page content.

## Popup Variations

### With Header Image:

```
┌─────────────────────────┐
│                         │
│   [Header Image]        │ 160px height
│                         │
│   ▼ Dark Gradient ▼    │
│   Page Title (white)    │ ← Overlaid on gradient
│   📍 Location (white)   │
└─────────────────────────┘
```

### Without Header Image:

```
┌─────────────────────────┐
│                         │
│   [Purple Gradient]     │ 160px height
│                         │
│   ▼ Dark Gradient ▼    │
│   Page Title (white)    │ ← Overlaid on gradient
│   📍 Location (white)   │
└─────────────────────────┘
```

## Design Specifications

### Popup Container:
- **Max Width:** 260px
- **Height:** 160px (fixed)
- **Border:** 2px solid #667eea (purple)
- **Border Radius:** 0.5rem
- **Shadow:** 0 8px 24px rgba(0, 0, 0, 0.2)
- **Padding:** 0
- **Overflow:** Hidden

### Image/Background:
- **Height:** 160px (full height)
- **Width:** 100% (full width)
- **Object Fit:** Cover
- **Fallback:** Purple gradient if no image

### Gradient Overlay:
- **Position:** Absolute, bottom
- **Background:** Linear gradient
  - Bottom: rgba(0,0,0,0.8)
  - Middle: rgba(0,0,0,0.6)
  - Top: transparent
- **Padding:** 2rem top, 0.75rem sides/bottom

### Title:
- **Color:** White
- **Font Size:** 0.875rem
- **Font Weight:** Bold
- **Text Shadow:** 0 1px 3px rgba(0,0,0,0.5)
- **Margin Bottom:** 0.25rem

### Location:
- **Icon:** 📍 emoji
- **Color:** rgba(255,255,255,0.9)
- **Font Size:** 0.75rem
- **Text Shadow:** 0 1px 2px rgba(0,0,0,0.5)

## Behavior

### Show Popup:
- Trigger: Mouse enters marker
- Animation: Fade in
- Position: Above marker (offset 35px)

### Hide Popup:
- Trigger: Mouse leaves marker
- Animation: Fade out
- Timing: Immediate

### Click:
- Action: Navigate to page
- Target: Same window
- URL: `/{slug}`

## Image Handling

### Loading:
- Images load asynchronously
- No loading spinner (quick load)
- Fallback: Show without image if fails

### Optimization:
- Browser caches images
- Same image as marker background
- Already loaded when popup shows

### Error Handling:
- If image fails to load, shows broken image icon
- Popup still functional
- Text content always visible

## Responsive Design

### Desktop:
- Full 280px width
- 120px image height
- Comfortable spacing

### Mobile:
- Scales to fit screen
- Maintains aspect ratio
- Touch-friendly

## Accessibility

### Screen Readers:
- Image has alt text (page title)
- Text content is readable
- Semantic HTML structure

### Keyboard:
- Popup appears on focus
- Can navigate with keyboard
- ESC closes popup

### Contrast:
- High contrast text
- Purple border for visibility
- White background for readability

## Examples

### Example 1: Travel Blog
```
┌─────────────────────────┐
│                         │
│  [Eiffel Tower Photo]   │
│                         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Dark gradient
│  My Trip to Paris       │ ← White text
│  📍 Paris, France       │
└─────────────────────────┘
```

### Example 2: Recipe
```
┌─────────────────────────┐
│                         │
│  [Chocolate Cake Photo] │
│                         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Dark gradient
│  Best Cake Recipe       │ ← White text
│  📍 New York, USA       │
└─────────────────────────┘
```

### Example 3: No Image
```
┌─────────────────────────┐
│                         │
│  [Purple Gradient BG]   │
│                         │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │ ← Dark gradient
│  My Blog Post           │ ← White text
│  📍 London, UK          │
└─────────────────────────┘
```

## CSS Classes

### Main Popup:
```css
.mapboxgl-popup-content {
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 0;
  overflow: hidden;
}
```

### Custom Class:
```css
.page-marker-popup .mapboxgl-popup-content {
  border: 2px solid #667eea;
}
```

## Performance

- Popups created once per marker
- Reused on hover (not recreated)
- Images cached by browser
- Minimal DOM manipulation
- Smooth animations

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Future Enhancements

Possible additions:
- Fade-in animation for images
- Skeleton loader for images
- More metadata (date, views)
- Social sharing buttons
- Preview of page content
- Multiple images carousel

## Tips for Best Results

### Image Selection:
- Use landscape images (wider than tall)
- High resolution (at least 560px wide)
- Clear subject matter
- Good contrast

### Avoid:
- Very tall images (will be cropped)
- Low resolution images (pixelated)
- Text-heavy images (unreadable at small size)
- Very dark images (hard to see details)

## Summary

The enhanced popup design provides a rich preview of pages with header images while maintaining a clean, simple design for pages without images. The 120px image height provides enough space to show meaningful content without overwhelming the popup, and the consistent layout ensures a professional appearance across all pages.
