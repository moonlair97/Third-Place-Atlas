# Third-Place Atlas

Third-Place Atlas is a vibe-forward map for calm, welcoming third places. Browse by mood, filter by accessibility and comfort, and add new spots for others to discover.

## Features
- Filter places by quiet, lighting, outlets, low-sensory, linger-friendly, and open-late vibes
- Explore on an interactive map with markers and previews
- Add new places with a guided form and click-to-drop coordinates
- Works with Supabase or a local JSON fallback

## Quick Start
1. Install dependencies.
1. Run the dev server.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the map.

## Environment Variables
Supabase is optional. If you do not set these, the app will use `data/places.seattle.json` and `data/user-places.json`.

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Project Layout
- `app/page.tsx` Map experience and filtering UI
- `app/add/page.tsx` Add-a-place form
- `app/api/places/route.ts` Places API (Supabase or JSON fallback)
- `components/` UI components
- `data/` Seed data and user-added places

## Notes
- The API expects `lat` and `lng` as numeric values.
- User submissions are stored in `data/user-places.json` when Supabase is not configured.
