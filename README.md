# Mapbox Globe Next.js App

A Next.js application displaying an interactive 3D globe using Mapbox GL JS with a dark theme.

## Setup

1. Get your Mapbox access token from [Mapbox](https://account.mapbox.com/access-tokens/)

2. Add your token to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_actual_token_here
   ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- 3D globe projection with Mapbox dark theme
- Atmospheric fog effects with stars
- Responsive full-screen display
- TypeScript support
