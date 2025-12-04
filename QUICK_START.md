# Quick Start Guide 🚀

## 1. Database Setup (REQUIRED)

```bash
# Go to: https://supabase.com/dashboard
# Navigate to: SQL Editor
# Copy and paste the entire content of: supabase-setup.sql
# Click "Run"
```

## 2. Start Development

```bash
cd mapbox-globe
npm run dev
```

## 3. Test the Flow (5 minutes)

### Step 1: Register (30 seconds)
- Visit: http://localhost:3000
- Click "Login" button
- Click "Don't have an account? Register"
- Enter email and password
- Click "Register"

### Step 2: Login (15 seconds)
- Enter your credentials
- Click "Login"
- You'll see "My Sites" and "Create" buttons

### Step 3: Create Page (2 minutes)
- Click "Create" button
- Click "+ Heading" → Type "Welcome to My Page"
- Click "+ Paragraph" → Type some text
- Click "+ Button" → Keep default
- Click "Publish" button

### Step 4: Publish with Location (1 minute)
- Enter title: "My First Page"
- Click anywhere on the map (try Paris!)
- See location name appear
- Click "Publish" button
- Click "Copy" to copy URL

### Step 5: View Your Page (30 seconds)
- Open copied URL in new tab
- See your published page!
- Try clicking the button

### Step 6: Check Dashboard (30 seconds)
- Go back to home
- Click "My Sites" button
- See your published page
- View location and coordinates

### Step 7: See on Globe (30 seconds)
- Click "← Home" button
- Find the purple marker on globe
- Click it to visit your page

## Done! 🎉

You now have:
- ✅ User authentication
- ✅ Page builder
- ✅ Location selection
- ✅ Public pages
- ✅ Globe markers
- ✅ Dashboard

## Common Issues

**"Can't login"**
→ Check if you confirmed your email (or disable email confirmation in Supabase)

**"Publish button disabled"**
→ Add at least one component first

**"No location selected error"**
→ Click on the map before publishing

**"Markers not showing"**
→ Make sure you ran the SQL setup script

## What's Next?

- Create more pages
- Try different locations
- Customize components
- Share your URLs
- Explore the globe

## Need Help?

Check these files:
- `COMPLETE_FEATURES.md` - Full feature list
- `LOCATION_FEATURE.md` - Location details
- `SLUG_FEATURE.md` - Public pages
- `AUTH_SETUP.md` - Authentication

## Pro Tips

1. **Spooky Mode**: Click the ⚙ icon on any component → Enable "🎃 Spooky Mode"
2. **Button Actions**: Add confetti or emoji rain to buttons
3. **Gallery**: Use the Gallery component for multiple images
4. **Dark Theme**: Toggle theme before publishing
5. **Location**: Click famous landmarks for cool locations!

Enjoy building! 🌍✨
