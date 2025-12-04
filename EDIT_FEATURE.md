# Edit Page Feature

## Overview

Users can now edit their published pages. The edit feature loads the existing page into the page builder, allows modifications, and updates the page while preserving the original slug.

## How It Works

### Edit Flow:

1. **Go to My Sites** - Click "My Sites" in user menu
2. **Find Page** - Locate the page you want to edit
3. **Click Edit** - Click the "✏️ Edit" button
4. **Modify** - Change components, styles, or settings
5. **Update** - Click "Update" button
6. **Save** - Page is updated with new content

### URL Pattern:

```
/create?edit={pageId}
```

Example: `/create?edit=123e4567-e89b-12d3-a456-426614174000`

## Features

### What Can Be Edited:

✅ **Page Title** - Change the title
✅ **Site Name** - Update branding
✅ **Header Image** - Change or remove image
✅ **Components** - Add, remove, or modify
✅ **Component Styles** - Update colors, fonts, etc.
✅ **Theme** - Switch between light/dark
✅ **Location** - Change map position
✅ **Location Name** - Update location

### What Cannot Be Edited:

❌ **Slug** - URL remains the same
❌ **User ID** - Owner cannot change
❌ **Published Date** - Original date preserved
❌ **Page ID** - Unique identifier stays same

## UI Changes

### My Sites Dashboard:

**Button Layout:**
```
[View Page] [✏️ Edit] [Copy] [🗑️]
```

### Page Builder:

**Create Mode:**
- Title: "Page Builder"
- Button: "Publish"
- Modal: "Publish Page"

**Edit Mode:**
- Title: "Page Builder"
- Button: "Update"
- Modal: "Update Page"
- Pre-filled with existing data

## Data Loading

### Edit Mode Initialization:

```typescript
1. URL: /create?edit={pageId}
2. Fetch page data from Supabase
3. Load into PageBuilder:
   - components
   - title
   - site_name
   - theme
   - header_image
   - latitude/longitude
   - location_name
4. User modifies
5. Click "Update"
6. Save to database
```

### Loading State:

```
┌─────────────────────┐
│  Loading page...    │
│  Please wait        │
└─────────────────────┘
```

## Server Actions

### Get Page for Edit:
```typescript
export async function getPageForEdit(pageId: string) {
  // Verify user owns the page
  // Fetch all page data
  // Return for editing
}
```

### Update Page:
```typescript
export async function updatePage(pageId: string, pageData: {...}) {
  // Verify user owns the page
  // Update all fields except slug
  // Revalidate paths
  // Return success
}
```

## Security

### Row Level Security:
```sql
CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE
  USING (auth.uid() = user_id);
```

### Verification:
- User must be logged in
- User must own the page
- Double check: `.eq('user_id', user.id)`

### What's Protected:
- ✅ Can't edit other users' pages
- ✅ Can't change slug
- ✅ Can't change owner
- ✅ RLS enforced at database level

## Use Cases

### 1. Fix Typos
- Edit page
- Correct spelling errors
- Update immediately

### 2. Update Content
- Add new components
- Remove outdated info
- Refresh images

### 3. Change Location
- Move marker on globe
- Update coordinates
- Reflect new location

### 4. Rebrand
- Update site name
- Change header image
- Refresh appearance

### 5. Theme Change
- Switch light/dark
- Update for better readability

## Workflow Examples

### Example 1: Update Travel Blog
```
1. Published: "My Trip to Paris"
2. Edit: Add more photos
3. Update: New gallery component
4. Result: Enhanced page, same URL
```

### Example 2: Fix Error
```
1. Published: "Recpie for Cake" (typo)
2. Edit: Change title
3. Update: "Recipe for Cake"
4. Result: Fixed title, same URL
```

### Example 3: Rebrand
```
1. Published: Site Name "My Blog"
2. Edit: Change to "Travel Diaries"
3. Update: New site name
4. Result: Updated marker, same URL
```

## Button States

### Edit Button:
- **Normal:** "✏️ Edit" (green)
- **Hover:** Darker green
- **Click:** Navigate to edit mode

### Update Button (in builder):
- **Normal:** "Update" (purple)
- **Loading:** "Updating..."
- **Disabled:** If no changes

### Delete Button:
- **Normal:** "🗑️" (red)
- **Loading:** "..."
- **Disabled:** While deleting

## Success Messages

### After Update:
```
✓ Page updated successfully!
```

### After Publish (new):
```
✓ Page published successfully!
```

## Error Handling

### Possible Errors:

**Not Logged In:**
```
Error: You must be logged in to edit a page
```

**Not Owner:**
```
Error: Permission denied
```

**Page Not Found:**
```
Error: Page not found
```

**Database Error:**
```
Error: [Database error message]
```

## Comparison: Create vs Edit

| Feature | Create Mode | Edit Mode |
|---------|-------------|-----------|
| URL | `/create` | `/create?edit={id}` |
| Button | "Publish" | "Update" |
| Modal | "Publish Page" | "Update Page" |
| Slug | Generated | Preserved |
| Data | Empty | Pre-filled |
| Success | "Published" | "Updated" |

## Technical Implementation

### Route:
```typescript
// /create/page.tsx
const editId = searchParams.get('edit');
<PageBuilder editMode={!!editId} initialData={pageData} />
```

### Component:
```typescript
// PageBuilder.tsx
interface PageBuilderProps {
  editMode?: boolean;
  initialData?: any;
}

useEffect(() => {
  if (editMode && initialData) {
    // Load all fields
    setComponents(initialData.components);
    setPageTitle(initialData.title);
    // ... etc
  }
}, [editMode, initialData]);
```

### Action:
```typescript
const result = editMode && editPageId
  ? await updatePage(editPageId, pageData)
  : await publishPage(pageData);
```

## Future Enhancements

Possible additions:
- Version history
- Draft mode
- Auto-save
- Undo/redo
- Duplicate page
- Bulk edit
- Edit preview
- Change slug

## Summary

The edit feature provides a seamless way to update published pages. Users can modify any aspect of their page except the slug, ensuring URLs remain stable while content stays fresh. The feature integrates naturally with the existing page builder, using the same interface for both creating and editing pages.
