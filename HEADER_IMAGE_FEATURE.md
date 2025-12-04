# Header Image Feature

## Overview

Users can now add an optional header image to their published pages. The image appears at the top of the page, above the title.

## Features

### 1. **Add Header Image During Publishing**
- Optional field in publish modal
- Enter any image URL
- Live preview before publishing
- Validates URL format

### 2. **Display on Public Pages**
- Full-width header image
- Max height: 400px
- Cover fit (maintains aspect ratio)
- Appears above page title

### 3. **Show in Dashboard**
- Thumbnail in "My Sites" cards
- 200px height preview
- Zoom effect on hover
- Helps identify pages visually

## Usage

### Publishing with Header Image:

1. **Create Page** - Build your page in `/create`
2. **Click Publish** - Open publish modal
3. **Enter Title** - Required field
4. **Add Header Image** - Optional
   - Paste image URL (e.g., `https://example.com/image.jpg`)
   - See live preview below input
   - Image validates automatically
5. **Select Location** - Required
6. **Publish** - Page saves with header image

### Supported Image Sources:

- Direct URLs: `https://example.com/image.jpg`
- Image hosting: Imgur, Cloudinary, etc.
- CDN links: Any public CDN
- Unsplash: `https://images.unsplash.com/...`
- Your own server: Any accessible URL

### Recommended Specs:

- **Format:** JPG, PNG, WebP, GIF
- **Dimensions:** 1200x400px or wider
- **Aspect Ratio:** 3:1 (landscape)
- **File Size:** < 2MB for fast loading
- **Quality:** High resolution for best display

## Database Schema

```sql
ALTER TABLE pages ADD COLUMN header_image TEXT;
```

**Field:**
- `header_image` - TEXT, nullable
- Stores full URL to image
- NULL if no header image

## Implementation Details

### 1. **Publish Flow**

```typescript
publishPage({
  title: "My Page",
  components: [...],
  theme: 'light',
  headerImage: "https://example.com/image.jpg", // Optional
  latitude: 48.8566,
  longitude: 2.3522,
  locationName: "Paris"
})
```

### 2. **Public Page Display**

```tsx
{page.header_image && (
  <div className={styles.headerImage}>
    <img src={page.header_image} alt={page.title} />
  </div>
)}
```

### 3. **Dashboard Display**

```tsx
{page.header_image && (
  <div className={styles.cardImage}>
    <img src={page.header_image} alt={page.title} />
  </div>
)}
```

## Styling

### Public Page Header:
- Full width
- Max height: 400px
- Object-fit: cover
- Margin bottom: 2rem

### Dashboard Card:
- Full card width
- Height: 200px
- Border radius: top corners only
- Hover zoom effect (1.05x)

## Examples

### Example 1: Travel Blog
```
Title: "My Trip to Paris"
Header Image: https://images.unsplash.com/photo-paris-eiffel-tower
Result: Beautiful Eiffel Tower image at top of page
```

### Example 2: Recipe Page
```
Title: "Chocolate Cake Recipe"
Header Image: https://example.com/chocolate-cake.jpg
Result: Appetizing cake photo as header
```

### Example 3: Portfolio
```
Title: "My Design Work"
Header Image: https://cdn.example.com/portfolio-banner.png
Result: Professional banner image
```

## Benefits

✅ **Visual Appeal** - Makes pages more attractive
✅ **Context** - Image sets the tone for content
✅ **Recognition** - Easy to identify pages in dashboard
✅ **Professional** - Looks more polished
✅ **Optional** - Not required, flexible
✅ **Simple** - Just paste a URL

## Tips

### Finding Good Images:

1. **Unsplash** - Free high-quality photos
   - Visit: https://unsplash.com
   - Right-click image → Copy image address

2. **Pexels** - Free stock photos
   - Visit: https://pexels.com
   - Download or copy link

3. **Your Own** - Upload to image host
   - Use: Imgur, Cloudinary, etc.
   - Get public URL

### Best Practices:

- Use landscape orientation (wider than tall)
- Choose high-resolution images
- Ensure image is publicly accessible
- Test URL before publishing
- Consider page theme (light/dark)
- Match image to content topic

## Troubleshooting

**Image not showing?**
- Check URL is correct and accessible
- Ensure URL starts with `https://`
- Verify image format is supported
- Try opening URL in new tab

**Image looks stretched?**
- Use landscape images (3:1 ratio)
- Minimum width: 1200px
- Let cover fit handle sizing

**Preview not loading?**
- Wait a few seconds
- Check internet connection
- Verify URL is valid
- Try different image

## Future Enhancements

Possible additions:
- Image upload (vs. URL only)
- Image cropping tool
- Multiple header styles
- Parallax scroll effect
- Overlay text on image
- Image filters/effects

## Migration

If you have existing pages without header images:
- They continue to work normally
- Header image is optional
- Can add later via edit feature
- No breaking changes

## Summary

The header image feature adds visual appeal to published pages with minimal complexity. Users simply paste an image URL during publishing, and it displays beautifully on the public page and in the dashboard.
