# Site Name Feature

## Overview

Pages now have an optional "Site Name" field that's separate from the page title. The site name appears on globe marker cards, while the title is used for the page itself and URL slug generation.

## Purpose

**Site Name** - Brand/site identifier shown on globe
**Title** - Specific page title used for content and slug

### Example:
- **Site Name:** "John's Travel Blog"
- **Title:** "My Trip to Paris 2024"
- **Slug:** `my-trip-to-paris-2024`
- **Marker Shows:** "John's Travel Blog"
- **Page Shows:** "My Trip to Paris 2024"

## Benefits

✅ **Consistent Branding** - Same site name across all pages
✅ **Better Recognition** - Users recognize your brand on globe
✅ **Flexible Titles** - Page titles can be specific
✅ **Professional** - Looks more polished
✅ **Optional** - Falls back to title if not provided

## Usage

### Publishing with Site Name:

1. **Create Page** - Build your page in `/create`
2. **Click Publish** - Open publish modal
3. **Enter Page Title** - Required (e.g., "My Trip to Paris")
4. **Enter Site Name** - Optional (e.g., "John's Travel Blog")
5. **Add Header Image** - Optional
6. **Select Location** - Required
7. **Publish** - Site name appears on marker

### Examples:

#### Travel Blog:
```
Site Name: "Wanderlust Adventures"
Title: "Exploring Tokyo"
Marker Shows: "Wanderlust Adventures"
Page Shows: "Exploring Tokyo"
```

#### Portfolio:
```
Site Name: "Sarah's Design Studio"
Title: "Brand Identity Project"
Marker Shows: "Sarah's Design Studio"
Page Shows: "Brand Identity Project"
```

#### Recipe Site:
```
Site Name: "Mom's Kitchen"
Title: "Chocolate Chip Cookies"
Marker Shows: "Mom's Kitchen"
Page Shows: "Chocolate Chip Cookies"
```

#### No Site Name:
```
Site Name: (empty)
Title: "My Blog Post"
Marker Shows: "My Blog Post"
Page Shows: "My Blog Post"
```

## Database Schema

```sql
ALTER TABLE pages ADD COLUMN site_name TEXT;
```

**Field:**
- `site_name` - TEXT, nullable
- Optional branding/site identifier
- Falls back to `title` if NULL

## Display Logic

### Globe Marker Card:
```typescript
${page.site_name || page.title}
```
Shows site_name if available, otherwise shows title

### Public Page:
```typescript
${page.title}
```
Always shows the page title

### URL Slug:
```typescript
generateSlug(page.title)
```
Generated from title, not site name

## Use Cases

### 1. Multi-Page Sites
Create multiple pages under one brand:
- Site Name: "Tech Reviews"
- Pages: "iPhone 15 Review", "MacBook Pro Review", etc.
- All markers show "Tech Reviews"

### 2. Personal Brand
Consistent identity across content:
- Site Name: "Jane Doe Photography"
- Pages: "Wedding Portfolio", "Nature Shots", etc.
- All markers show "Jane Doe Photography"

### 3. Business Pages
Company branding:
- Site Name: "Acme Corp"
- Pages: "About Us", "Services", "Contact"
- All markers show "Acme Corp"

### 4. Single Pages
No site name needed:
- Site Name: (empty)
- Title: "My Personal Story"
- Marker shows title

## Best Practices

### Good Site Names:
- Short and memorable
- Brand or personal name
- Consistent across pages
- 2-4 words ideal

### Examples:
- ✅ "Travel Diaries"
- ✅ "John's Blog"
- ✅ "Design Studio"
- ✅ "Food Adventures"

### Avoid:
- ❌ Very long names (truncated on marker)
- ❌ Special characters
- ❌ URLs or links
- ❌ Generic names like "My Site"

## Migration

Existing pages without site_name:
- Continue to work normally
- Show title on marker (as before)
- Can add site_name anytime
- No breaking changes

## Future Enhancements

Possible additions:
- Site logo/icon
- Site description
- Group pages by site name
- Filter globe by site
- Site-level settings
- Multi-site management

## Summary

The site name feature allows you to maintain consistent branding across multiple pages while keeping specific page titles. It's completely optional and provides a professional way to identify your content on the globe.
