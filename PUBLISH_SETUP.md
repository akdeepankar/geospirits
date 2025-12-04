# Publish Feature Setup

## Database Setup

To enable the publish feature, you need to create the `pages` table in your Supabase database.

### Steps:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-setup.sql` and run it in the SQL Editor
4. This will create:
   - `pages` table to store published pages
   - Row Level Security policies (users can only access their own pages)
   - Indexes for better performance
   - Auto-update trigger for `updated_at` timestamp

## Features Implemented

✅ **Create Button** - Logged-in users see a "Create" button in the user menu
✅ **Publish Modal** - Users can publish their pages with a title
✅ **Database Storage** - Pages are saved to Supabase with user association
✅ **Security** - Row Level Security ensures users can only access their own pages
✅ **Validation** - Checks for page title and at least one component

## How It Works

1. **Login** - User must be logged in to see the Create button
2. **Navigate to /create** - Click the Create button to go to the page builder
3. **Build Page** - Add and customize components
4. **Publish** - Click the Publish button in the toolbar
5. **Enter Title** - Provide a title for your page
6. **Save** - Page is saved to the database with your user ID

## Database Schema

```sql
pages (
  id UUID PRIMARY KEY,
  user_id UUID (references auth.users),
  title TEXT,
  components JSONB,
  theme TEXT,
  published_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## Next Steps (Optional Enhancements)

- View published pages list
- Edit existing pages
- Delete pages
- Share pages with public URLs
- Page analytics
