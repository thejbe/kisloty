# Kisloty MVP - Setup Summary

## What's Been Built

I've created a complete MVP implementation of Kisloty with all the core features you specified. Here's what's ready:

### ✅ Project Infrastructure

- **Vite + React + TypeScript** project fully configured
- **Tailwind CSS** with custom design tokens matching your designs
- **Supabase** client setup for auth and database
- Full TypeScript typing for type-safe development
- React Router v7 for navigation

### ✅ Database Schema & Security

Created comprehensive SQL migrations in `supabase/migrations/`:

1. **001_initial_schema.sql**: All tables with proper relationships
   - profiles (user info, onboarding status)
   - activity_templates (pre-seeded with 20 activities)
   - activities (with 3 time-frame types: now/scheduled/someday)
   - preferences (user's favorite activities, bucket list)
   - friendships (friend graph with status)
   - weekly_digest_settings (for future email feature)

2. **002_rls_policies.sql**: Row Level Security policies
   - Users can only see their own private data
   - Friends can see each other's 'friends' visibility activities
   - All template data is publicly readable

### ✅ Pages & Features

#### Landing Page (`/`)
- Beautiful hero with stacked activity cards
- "Get started" flow
- Auto-redirects authenticated users

#### Onboarding (`/onboarding`)
- Email magic link authentication
- Chat-style wizard with 5 steps:
  1. Email sign-in
  2. Location (city)
  3. Typical available time
  4. Favorite micro-actions
  5. Favorite hobbies
- Progress indicator
- Stores all data to profiles + preferences tables

#### Home Feed (`/app`)
- Personalized greeting
- Smart suggestion tiles (rule-based AI)
- Friend activity tiles with:
  - Avatar, name, activity title
  - Time display (Now/Tomorrow/In X days/Someday)
  - Location
  - Action buttons
- Floating "Start a small thing" button
- Top navigation with profile link

#### Profile Page (`/profile`)
- Edit display name
- Select favorite micro-actions (multi-select chips)
- Select favorite hobbies (multi-select chips)
- Manage bucket list (add/remove items)
- Sign out button

### ✅ Create Activity Modal

Full-featured modal with:

1. **Template Selection**:
   - Emoji grid of micro-actions
   - Emoji grid of hobbies
   - Organized by type

2. **Time Frame Selection** (exactly as specified):
   - "Now" (one-tap)
   - "Pick a date" (date + time picker, constrained to 30 days)
   - "Sometime in the future" (no date required)

3. **Optional Details**:
   - Location (free text)
   - Note/description

### ✅ Components

Reusable, well-typed components:
- `ActivityTile`: Friend activity display
- `SuggestionTile`: AI suggestion display
- `CreateActivityModal`: Full activity creation flow

### ✅ Smart Suggestions

Simple rule-based logic in `HomeFeed.tsx`:
- Considers time of day (morning/afternoon/evening)
- Considers day type (weekday/weekend)
- Uses user preferences from onboarding
- Generates contextual suggestions like:
  - "It's a quiet evening – would you like to read somewhere cosy for 20 mins?"
  - "Weekend coming up – maybe try a market?"

## File Structure

```
kislotypeople/
├── src/
│   ├── components/
│   │   ├── ActivityTile.tsx
│   │   ├── SuggestionTile.tsx
│   │   └── CreateActivityModal.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Onboarding.tsx
│   │   ├── HomeFeed.tsx
│   │   └── Profile.tsx
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── utils.ts          # Date formatting, time helpers
│   ├── types/
│   │   ├── index.ts          # Domain types
│   │   └── database.ts       # Supabase types
│   ├── App.tsx               # Router config
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_rls_policies.sql
├── designs/                  # Your Stitch designs (preserved)
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Next Steps to Run

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings > API** and copy:
   - Project URL
   - `anon` public key

3. Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Run Database Migrations

In your Supabase dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**
5. Repeat with `supabase/migrations/002_rls_policies.sql`

This creates all tables, indexes, RLS policies, and seeds 20 activity templates.

### 3. Configure Supabase Auth

In Supabase dashboard:

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Go to **Authentication > URL Configuration**
4. Add `http://localhost:5173` to allowed redirect URLs
5. (Later add your production URL)

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## How to Test the Flow

1. **Landing**: Click "Get started"
2. **Auth**: Enter your email, check inbox for magic link
3. **Onboarding**:
   - Enter a city
   - Select time preference
   - Continue through steps
   - Select favorite hobbies
   - Click "Go to Home Feed"
4. **Home Feed**:
   - See suggestion tile
   - Click "Start a small thing"
   - Create an activity with different time frames
5. **Profile**:
   - Click avatar in header
   - Edit preferences
   - Add bucket list items

## Design Integration

All pages closely match your Stitch designs from the `designs/` folder:
- Same color palette (#e29578 primary)
- Same component structure
- Same typography (Inter font)
- Same spacing and border radius
- Dark mode ready

## Key Features Implemented

✅ Email magic link authentication
✅ Profile creation with onboarding
✅ Activity templates (pre-seeded)
✅ Activity creation with 3 time modes
✅ Friend activity feed (ready for friendships)
✅ Smart suggestions (rule-based)
✅ Preferences management
✅ Bucket list
✅ RLS security
✅ Responsive design
✅ Dark mode support

## What's Ready for Later

The schema includes but doesn't yet use:
- **Friendships table**: Ready for friend invites/accept flow
- **Weekly digest settings**: Ready for email integration
- **Activity visibility**: Set to 'friends' by default, can support 'public' later
- **Activity status**: Tracks planned/in_progress/done (not used in UI yet)

## Schema Highlights

### Time Framing Logic

The `activities` table enforces:
- `time_frame_type` enum: 'now' | 'scheduled' | 'someday'
- Constraint: scheduled activities must have `scheduled_at`
- Constraint: scheduled activities must be ≤30 days in future
- Indexes on `scheduled_at` and `time_frame_type` for fast queries

### Security

RLS policies ensure:
- Users can read/write their own profile and preferences
- Users can read friend activities (when friendship status = 'accepted')
- Users can only create activities for themselves
- Activity templates are read-only

## Production Deployment

When ready to deploy:

1. **Build**: `npm run build`
2. **Deploy** `dist/` folder to Netlify/Vercel
3. **Set env vars** in hosting dashboard
4. **Update Supabase** redirect URLs with production domain
5. **Test** auth flow on production

## Notes

- All code is TypeScript with strict typing
- Components are small and composable
- Direct Supabase calls from frontend (can move to API later)
- No external state management yet (can add Zustand/Context later if needed)
- Images/avatars currently use placeholder gradients (add upload later)
- Friend management UI not built yet (schema is ready)

Everything is ready for you to run locally and start testing! 🎉
