# Kisloty

**"Do more things together."**

A lightweight social app that helps people do more things in real life with friends.

## Overview

Kisloty is designed to help lonely but social people, busy adults, and anyone who wants more real-life connection but lacks activation energy. It's a gentle, non-judgmental app that encourages micro-actions and small hobbies without the performance pressure of traditional social media.

### Key Features

- **Activity Feed**: See what your friends are doing now, soon, or planning for "someday"
- **Smart Suggestions**: Context-aware activity suggestions based on time of day, weather, and your preferences
- **Flexible Time Framing**: Activities can be "now", scheduled within 30 days, or "someday"
- **Chat-Style Onboarding**: Warm, conversational onboarding that learns your preferences
- **Low-Friction Creation**: Easy activity creation with emoji-based templates

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design tokens
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: React Router v7
- **Deployment**: Static hosting (Netlify/Vercel) + Supabase

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works great)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Copy `.env.example` to `.env` and add your credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Database Migrations

In your Supabase project dashboard:

1. Go to SQL Editor
2. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Then run `supabase/migrations/002_rls_policies.sql`

This will create all tables, seed activity templates, and set up Row Level Security policies.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static host.

## Project Structure

```
kislotypeople/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ActivityTile.tsx
│   │   ├── SuggestionTile.tsx
│   │   └── CreateActivityModal.tsx
│   ├── pages/              # Route pages
│   │   ├── Landing.tsx
│   │   ├── Onboarding.tsx
│   │   ├── HomeFeed.tsx
│   │   └── Profile.tsx
│   ├── lib/                # Utilities and configs
│   │   ├── supabase.ts
│   │   └── utils.ts
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts
│   │   └── database.ts
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles + Tailwind
├── supabase/
│   └── migrations/         # Database schema & RLS policies
├── designs/                # HTML/CSS design references
└── public/                 # Static assets
```

## Database Schema

### Core Tables

- **profiles**: User profiles with display name, location, avatar, onboarding status
- **activity_templates**: Pre-defined activity templates (micro-actions, hobbies)
- **activities**: User-created activities with flexible time framing
- **preferences**: User preferences from onboarding (favorite activities, time prefs, bucket list)
- **friendships**: Friend relationships (pending/accepted/blocked)
- **weekly_digest_settings**: Email digest preferences (for future use)

### Time Frame Types

Activities support three time modes:

1. **Now**: User is doing this right now
2. **Scheduled**: Specific date/time within next 30 days
3. **Someday**: Future plan without specific date

## Key Design Decisions

### Authentication

- Email magic link only for MVP (passwordless)
- Supabase Auth handles all token management
- RLS policies secure data access automatically

### Data Access

- Direct Supabase client calls from frontend for MVP
- RLS policies ensure users can only:
  - See their own profile/preferences/activities
  - See activities from friends (when visibility = 'friends')
  - Read activity templates

### Styling

- Custom Tailwind config matches the design system
- Warm, calm color palette (#e29578 primary)
- Supports both light and dark modes
- Uses Inter font family

### Smart Suggestions

- Simple rule-based system for MVP (no AI/ML)
- Uses time of day, day of week, and user preferences
- Can be enhanced later with more sophisticated logic

## Development Workflow

### Running Locally

```bash
npm run dev
```

### Type Checking

TypeScript is configured with strict mode. Check types with:

```bash
npx tsc --noEmit
```

### Building

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Recommended: Netlify or Vercel

1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Supabase Configuration

- Authentication: Enable email provider in Supabase dashboard
- URL Configuration: Add your deployment URL to allowed redirect URLs

## Roadmap

### MVP (Current)

- ✅ Auth with email magic link
- ✅ Onboarding flow
- ✅ Activity creation with 3 time modes
- ✅ Home feed with friend activities
- ✅ Smart suggestions
- ✅ Profile/preferences editing

### Post-MVP

- [ ] Friend invitations and management
- [ ] In-app messaging or WhatsApp deep links
- [ ] Weekly email digest
- [ ] Push notifications
- [ ] Activity reactions/responses
- [ ] Location-based suggestions
- [ ] Weather integration
- [ ] Analytics dashboard

## Contributing

This is a personal project, but feedback and suggestions are welcome! Open an issue to discuss any changes.

## License

ISC
