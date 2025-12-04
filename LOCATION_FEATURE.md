# Location & My Sites Feature

## Overview

Complete implementation of location-based publishing with globe visualization and site management dashboard.

## Features Implemented

### 1. Location Selection on Publish
✅ Interactive Mapbox globe in publish modal
✅ Click anywhere to select location
✅ Reverse geocoding for location names
✅ Visual marker shows selected location
✅ Lat/long saved with published page

### 2. Globe Visualization
✅ Published pages appear as markers on main globe
✅ Purple markers for user-created pages
✅ Click marker to visit the page
✅ Real-time display of all published pages

### 3. My Sites Dashboard
✅ View all your published pages
✅ See location, coordinates, and publish date
✅ Quick access to view or copy page URLs
✅ Beautiful card-based layout
✅ Empty state for new users

## User Flow

### Publishing with Location

1. **Create Page** - Build your page in `/create`
2. **Click Publish** - Opens modal with title and map
3. **Enter Title** - Give your page a name
4. **Select Location** - Click anywhere on the globe
5. **Confirm** - Location name appears below map
6. **Publish** - Page is saved with coordinates
7. **Get URL** - Copy your public page link

### Viewing on Globe

1. **Visit Home** - Go to main page with globe
2. **See Markers** - Purple markers show published pages
3. **Click Marker** - Opens the published page
4. **Explore** - Rotate globe to find more pages

### Managing Sites

1. **Click "My Sites"** - In user menu
2. **View Dashboard** - See all your pages
3. **Check Details** - Location, coordinates, date
4. **Quick Actions** - View page or copy URL
5. **Create More** - Click "Create New" button

## Database Schema

```sql
pages (
  id UUID PRIMARY KEY,
  user_id UUID,
  title TEXT,
  slug TEXT UNIQUE,
  components JSONB,
  theme TEXT,
  latitude DOUBLE PRECISION,      -- New
  longitude DOUBLE PRECISION,     -- New
  location_name TEXT,             -- New
  published_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Files Created

### Components
- `app/components/LocationPicker.tsx` - Interactive map for location selection
- `app/components/MySitesView.tsx` - Dashboard view for user's sites

### Pages
- `app/my-sites/page.tsx` - My Sites dashboard route

### Styles
- `app/styles/locationPicker.module.css` - Location picker styles
- `app/styles/mySites.module.css` - Dashboard styles

### Modified Files
- `app/components/PageBuilder.tsx` - Added location picker to publish modal
- `app/components/MapboxGlobe.tsx` - Added published pages as markers
- `app/components/UserMenu.tsx` - Added "My Sites" button
- `app/actions/pages.ts` - Added location fields and getAllPublishedPages
- `app/styles/pageBuilder.module.css` - Larger modal for map
- `app/styles/userMenu.module.css` - My Sites button style
- `supabase-setup.sql` - Added location columns

## Setup Instructions

### 1. Update Database

Run this SQL in your Supabase dashboard:

```sql
-- Add location columns to existing table
ALTER TABLE pages 
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_name TEXT;

-- If creating new table, use the updated schema in supabase-setup.sql
```

### 2. Test the Features

**Test Publishing:**
```bash
npm run dev
# 1. Login
# 2. Go to /create
# 3. Add components
# 4. Click Publish
# 5. Enter title
# 6. Click on map to select location
# 7. Publish and get URL
```

**Test Globe:**
```bash
# 1. Go to home page
# 2. See purple markers for published pages
# 3. Click a marker to visit the page
```

**Test Dashboard:**
```bash
# 1. Click "My Sites" in user menu
# 2. View all your published pages
# 3. Click "View Page" or "Copy URL"
```

## UI Components

### Location Picker
- Full Mapbox globe with fog effects
- Click-to-select interaction
- Reverse geocoding for place names
- Visual feedback with marker
- Responsive design

### My Sites Dashboard
- Grid layout for page cards
- Each card shows:
  - Page title
  - Publish date
  - Location name
  - Coordinates
  - Public URL
  - Action buttons
- Empty state for new users
- Quick navigation buttons

### Globe Markers
- Purple circular markers
- White border for visibility
- Hover effect
- Click to navigate
- Distinct from sample markers

## Marker Styles

### Published Page Markers
- **Color:** Purple (#667eea)
- **Size:** 30px diameter
- **Border:** 3px white
- **Shape:** Circle
- **Shadow:** Subtle drop shadow

### Sample Markers (Original)
- **Style:** Custom SVG icons
- **Interaction:** Opens side panel

## API Endpoints

### Server Actions

```typescript
// Publish page with location
publishPage({
  title: string,
  components: any[],
  theme: 'light' | 'dark',
  latitude: number,
  longitude: number,
  locationName?: string
})

// Get all published pages (for globe)
getAllPublishedPages()

// Get user's pages (for dashboard)
getUserPages()

// Get page by slug (for public view)
getPageBySlug(slug: string)
```

## Security

- ✅ Only authenticated users can publish
- ✅ Users can only see their own pages in dashboard
- ✅ All published pages are publicly viewable
- ✅ Location data is validated
- ✅ Coordinates are stored as numbers

## Navigation Flow

```
Home (/)
├── Login → /auth
├── My Sites → /my-sites (logged in only)
├── Create → /create (logged in only)
└── Click Marker → /{slug}

My Sites (/my-sites)
├── Home → /
├── Create New → /create
└── View Page → /{slug}

Create (/create)
└── Publish → Shows modal with location picker
    └── Success → Shows URL with copy button
```

## Future Enhancements

- Edit page location
- Filter pages by location
- Search pages on globe
- Cluster markers when zoomed out
- Page analytics by location
- Location-based recommendations
- Export locations as GeoJSON
- Import locations from file

## Troubleshooting

**Map not loading in publish modal?**
- Check Mapbox token in .env.local
- Verify token has geocoding permissions
- Check browser console for errors

**Markers not appearing on globe?**
- Ensure pages have valid lat/long
- Check database has location columns
- Verify getAllPublishedPages returns data

**My Sites page redirects to auth?**
- Make sure you're logged in
- Check session is valid
- Verify middleware is working

**Location name not showing?**
- Geocoding API might be rate limited
- Falls back to coordinates if API fails
- Check Mapbox token permissions

## Example Locations

Try publishing pages at these interesting locations:

- **Eiffel Tower:** 48.8584, 2.2945
- **Statue of Liberty:** 40.6892, -74.0445
- **Sydney Opera House:** -33.8568, 151.2153
- **Great Wall of China:** 40.4319, 116.5704
- **Machu Picchu:** -13.1631, -72.5450
- **Taj Mahal:** 27.1751, 78.0421
- **Christ the Redeemer:** -22.9519, -43.2105
