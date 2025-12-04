# Delete Page Feature

## Overview

Users can now delete their published pages from the "My Sites" dashboard. Deleted pages are permanently removed from the database, globe, and are no longer accessible.

## How It Works

### Delete Flow:

1. **Go to My Sites** - Click "My Sites" in user menu
2. **Find Page** - Locate the page you want to delete
3. **Click Delete** - Click the 🗑️ trash icon
4. **Confirm** - Confirm deletion in modal
5. **Deleted** - Page is permanently removed

### Confirmation Modal:

```
┌─────────────────────────────┐
│  Delete Page?               │
│                             │
│  Are you sure you want to   │
│  delete this page? This     │
│  action cannot be undone.   │
│                             │
│  [Cancel]  [Delete]         │
└─────────────────────────────┘
```

## Security

### Row Level Security:
- Users can only delete their own pages
- Database enforces user_id check
- Double verification (client + server)

### Verification:
```sql
DELETE FROM pages 
WHERE id = ? 
AND user_id = ?
```

## What Gets Deleted

When you delete a page:

✅ **Database Record** - Removed from pages table
✅ **Globe Marker** - No longer appears on globe
✅ **Public URL** - `/{slug}` returns 404
✅ **Dashboard Entry** - Removed from My Sites

❌ **Header Image** - Not deleted (external URL)
❌ **User Account** - Remains intact

## UI Elements

### Delete Button:
- **Location:** Card footer in My Sites
- **Icon:** 🗑️ trash emoji
- **Color:** Light red background
- **Hover:** Darker red
- **Disabled:** While deleting

### Confirmation Modal:
- **Title:** "Delete Page?"
- **Message:** Warning about permanent deletion
- **Buttons:** Cancel (gray) and Delete (red)
- **Backdrop:** Dark overlay

## States

### Normal:
```
[View Page] [Copy URL] [🗑️]
```

### Deleting:
```
[View Page] [Copy URL] [Deleting...]
```

### After Delete:
```
Page removed from list
```

## Error Handling

### Possible Errors:

**Not Logged In:**
```
Error: You must be logged in to delete a page
```

**Not Owner:**
```
Error: Permission denied (RLS blocks)
```

**Database Error:**
```
Error: [Database error message]
```

### Error Display:
- Shows browser alert with error message
- Delete button re-enables
- User can try again

## Database

### Delete Query:
```typescript
await supabase
  .from('pages')
  .delete()
  .eq('id', pageId)
  .eq('user_id', user.id)
```

### RLS Policy:
```sql
CREATE POLICY "Users can delete their own pages"
  ON pages FOR DELETE
  USING (auth.uid() = user_id);
```

## User Experience

### Before Delete:
- Page visible in My Sites
- Page accessible at `/{slug}`
- Marker visible on globe

### After Delete:
- Page removed from My Sites
- URL returns 404
- Marker removed from globe
- Dashboard refreshes automatically

## Best Practices

### When to Delete:

✅ **Outdated Content** - Information no longer relevant
✅ **Duplicate Pages** - Accidentally created duplicates
✅ **Test Pages** - Testing/demo pages
✅ **Privacy** - Want to remove personal content

### Before Deleting:

⚠️ **Backup Content** - Copy text/images if needed
⚠️ **Check Links** - Update any external links
⚠️ **Notify Users** - If page is shared publicly
⚠️ **Consider Editing** - Maybe just update instead?

## Alternatives to Deletion

Instead of deleting, consider:

1. **Edit Page** - Update content (future feature)
2. **Change Location** - Move marker (future feature)
3. **Update Header Image** - Refresh appearance (future feature)
4. **Keep as Archive** - Leave for historical record

## Recovery

### Can I Recover Deleted Pages?

❌ **No Recovery** - Deletion is permanent
❌ **No Undo** - Cannot be reversed
❌ **No Backup** - Not stored after deletion

### Prevention:
- Confirmation modal prevents accidents
- Clear warning message
- Two-step process (click + confirm)

## Future Enhancements

Possible additions:
- Soft delete (archive instead of delete)
- Bulk delete multiple pages
- Delete confirmation checkbox
- Trash/recycle bin (30-day recovery)
- Export page before delete
- Delete history log

## Technical Details

### Server Action:
```typescript
export async function deletePage(pageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

### Client Component:
```typescript
const handleDelete = async (pageId: string) => {
  setDeletingId(pageId);
  const result = await deletePage(pageId);
  
  if (result.error) {
    alert(`Error: ${result.error}`);
  } else {
    window.location.reload();
  }
};
```

## Testing

### Test Scenarios:

1. **Normal Delete:**
   - Create page
   - Go to My Sites
   - Delete page
   - Verify removed

2. **Cancel Delete:**
   - Click delete
   - Click cancel
   - Verify page remains

3. **Multiple Pages:**
   - Create 3 pages
   - Delete 1
   - Verify others remain

4. **Permission Check:**
   - Try to delete another user's page
   - Verify blocked by RLS

## Summary

The delete feature provides a safe, secure way for users to remove their published pages. With confirmation modals and Row Level Security, it prevents accidental deletions while ensuring users can only delete their own content. The deletion is permanent and immediate, removing the page from all views and making the URL inaccessible.
