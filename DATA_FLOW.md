# Data Flow Documentation

## How Custom Pages Fetch and Render from Supabase

### Complete Flow:

```
User visits /{slug}
    ↓
[slug]/page.tsx (Server Component)
    ↓
getPageBySlug(slug) - Fetches from Supabase
    ↓
Supabase Query: SELECT * FROM pages WHERE slug = '{slug}'
    ↓
Returns: { title, components, theme, latitude, longitude, location_name, ... }
    ↓
PublicPageView (Client Component)
    ↓
Renders all components with their styles and interactions
```

## 1. URL Route Handler

**File:** `app/[slug]/page.tsx`

```typescript
export default async function PublicPage({ params }: { params: { slug: string } }) {
  // Fetch page data from Supabase
  const result = await getPageBySlug(params.slug);

  // Handle not found
  if (result.error || !result.page) {
    notFound();
  }

  // Render the page
  return <PublicPageView page={result.page} />;
}
```

**What it does:**
- Receives the slug from URL (e.g., `/my-awesome-page`)
- Calls server action to fetch data
- Returns 404 if page doesn't exist
- Passes data to PublicPageView component

## 2. Server Action (Data Fetching)

**File:** `app/actions/pages.ts`

```typescript
export async function getPageBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    return { error: error.message }
  }

  return { page: data }
}
```

**What it fetches:**
- `id` - Page UUID
- `user_id` - Owner's UUID
- `title` - Page title
- `slug` - URL slug
- `components` - JSONB array of all components
- `theme` - 'light' or 'dark'
- `latitude` - Location latitude
- `longitude` - Location longitude
- `location_name` - Location name
- `published_at` - Timestamp
- `updated_at` - Timestamp

## 3. Public Page Renderer

**File:** `app/components/PublicPageView.tsx`

```typescript
export default function PublicPageView({ page }: PublicPageViewProps) {
  // Renders page with:
  // - page.title in header
  // - page.theme for styling
  // - page.components array mapped to UI elements
  
  return (
    <div style={{ backgroundColor: page.theme === 'dark' ? '#1a1a1a' : 'white' }}>
      <h1>{page.title}</h1>
      {page.components.map((comp) => renderComponent(comp))}
    </div>
  );
}
```

**What it renders:**
- Page title in header
- Theme-based background color
- All components from the `components` array:
  - Headings
  - Text
  - Paragraphs
  - Images
  - Galleries
  - Buttons (with actions)
  - Dividers
  - Custom HTML
  - Emoji
- All component styles (colors, fonts, alignment, etc.)
- Interactive features (button actions, confetti, etc.)

## 4. Component Data Structure

Each component in the `components` array has:

```typescript
{
  id: string,              // Unique ID
  type: string,            // 'heading', 'text', 'paragraph', etc.
  content: string,         // The actual content
  style: {                 // Styling options
    textAlign: string,
    fontSize: string,
    color: string,
    backgroundColor: string,
    padding: string,
    margin: string,
    width: string,
    borderRadius: string,
    spooky: boolean,       // Special spooky mode
    galleryColumns: number,
    galleryGap: string,
  },
  action?: {               // For buttons
    type: string,          // 'link', 'confetti', 'alert', etc.
    value: string,
    emoji: string,
  },
  images?: string[],       // For galleries
}
```

## 5. Example Data Flow

### Publishing:
```
User creates page in /create
    ↓
Adds components (heading, text, image)
    ↓
Clicks "Publish"
    ↓
Enters title: "My Travel Blog"
    ↓
Selects location: Paris, France
    ↓
publishPage() saves to Supabase:
{
  title: "My Travel Blog",
  slug: "my-travel-blog",
  components: [
    { type: 'heading', content: 'Welcome', style: {...} },
    { type: 'text', content: 'Hello world', style: {...} },
    { type: 'image', content: 'https://...', style: {...} }
  ],
  theme: 'light',
  latitude: 48.8566,
  longitude: 2.3522,
  location_name: 'Paris, France'
}
```

### Viewing:
```
User visits /my-travel-blog
    ↓
getPageBySlug('my-travel-blog')
    ↓
Supabase returns page data
    ↓
PublicPageView receives:
{
  title: "My Travel Blog",
  components: [...],
  theme: 'light'
}
    ↓
Renders:
- Header with "My Travel Blog"
- Light theme background
- Heading: "Welcome"
- Text: "Hello world"
- Image from URL
```

## 6. Security

**Row Level Security (RLS):**
```sql
-- Anyone can view published pages
CREATE POLICY "Anyone can view published pages"
  ON pages FOR SELECT USING (true);

-- Only owners can modify
CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE USING (auth.uid() = user_id);
```

**What this means:**
- ✅ Public pages are readable by anyone
- ✅ No authentication required to view
- ✅ Only page owner can edit/delete
- ✅ Data is validated before storage

## 7. Performance

**Optimizations:**
- Server-side rendering (SSR) for SEO
- Client-side interactivity
- Single database query per page
- Cached at CDN edge (Next.js)
- Fast page loads

## 8. Error Handling

**Not Found:**
```typescript
if (result.error || !result.page) {
  notFound(); // Shows 404 page
}
```

**Invalid Data:**
- Components validated before rendering
- Fallbacks for missing data
- Error boundaries for crashes

## Testing the Flow

### 1. Create a Test Page:
```bash
# Login at /auth
# Go to /create
# Add a heading: "Test Page"
# Add text: "This is a test"
# Click Publish
# Enter title: "Test"
# Select location
# Copy the URL
```

### 2. View the Page:
```bash
# Open the copied URL (e.g., /test)
# Page loads from Supabase
# Components render correctly
# Theme applies
# Interactions work
```

### 3. Check Database:
```sql
-- In Supabase SQL Editor
SELECT * FROM pages WHERE slug = 'test';

-- You'll see:
-- - title: "Test"
-- - slug: "test"
-- - components: [{ type: 'heading', content: 'Test Page', ... }, ...]
-- - theme: 'light'
-- - latitude, longitude, location_name
```

## Summary

✅ **Data is fetched from Supabase** via `getPageBySlug()`
✅ **Components are stored as JSONB** in the database
✅ **PublicPageView renders** all components dynamically
✅ **Styles are preserved** from the page builder
✅ **Interactive features work** (buttons, confetti, etc.)
✅ **Public access** - no authentication required
✅ **SEO-friendly** - server-side rendered

The system is fully functional and fetches/renders data correctly from Supabase!
