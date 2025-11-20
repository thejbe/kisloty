# Kisloty Architecture

## Overview

Kisloty is a lightweight React SPA that connects directly to Supabase for all backend functionality. This architecture allows for rapid development while maintaining security through Row Level Security (RLS) policies.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   React App (Vite)                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │   Landing    │  │  Onboarding  │  │  HomeFeed  │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │  ┌──────────────┐  ┌──────────────┐                  │  │
│  │  │   Profile    │  │  Components  │                  │  │
│  │  └──────────────┘  └──────────────┘                  │  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │      Supabase Client (@supabase/supabase-js)  │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        Supabase                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ profiles │  │activities│  │activity_templates│    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘    │  │
│  │  ┌───────────┐  ┌────────────┐  ┌──────────────┐    │  │
│  │  │preferences│  │friendships │  │weekly_digest │    │  │
│  │  └───────────┘  └────────────┘  └──────────────┘    │  │
│  │                                                       │  │
│  │  RLS Policies enforce data access rules              │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Auth (GoTrue)                       │  │
│  │  - Magic link email authentication                   │  │
│  │  - JWT token management                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Authentication Flow

```
User enters email → Supabase sends magic link → User clicks link
→ Supabase validates → JWT token issued → Client stores token
→ All subsequent requests include JWT → RLS policies validate access
```

### Activity Creation Flow

```
User clicks "Start a small thing" → Modal opens → User selects template
→ User chooses time frame (now/scheduled/someday) → User adds details
→ Client calls supabase.from('activities').insert() with user_id
→ RLS policy checks: auth.uid() == user_id → Insert succeeds
→ Client refetches activities → UI updates
```

### Home Feed Data Flow

```
Page loads → Client calls supabase.auth.getUser()
→ Get user's profile → Get user's preferences
→ supabase.from('activities').select() with RLS filtering
→ RLS returns: own activities + friend activities (visibility='friends')
→ Client generates suggestions based on time/preferences
→ Render feed with activities + suggestions
```

## Security Model

### Row Level Security (RLS)

All tables have RLS enabled. Policies enforce:

1. **Profiles**
   - Users can read all profiles (needed to show friend info)
   - Users can only insert/update their own profile
   - Check: `auth.uid() = user_id`

2. **Activities**
   - Users can read their own activities
   - Users can read friend activities (if visibility='friends')
   - Users can read public activities (if visibility='public')
   - Users can only create/update/delete their own activities
   - Check: `auth.uid() = user_id` for mutations
   - Friend check: exists in friendships table with status='accepted'

3. **Preferences**
   - Users can only read/write their own preferences
   - Check: `auth.uid() = user_id`

4. **Friendships**
   - Users can read friendships where they're involved
   - Users can create friendships as initiator
   - Users can update/delete friendships they're part of
   - Check: `auth.uid() IN (user_id, friend_id)`

5. **Templates**
   - All authenticated users can read active templates
   - No write access (admin only via SQL)

### JWT Token Flow

```
1. User authenticates via magic link
2. Supabase issues JWT with claims:
   - sub: user_id (UUID)
   - email: user's email
   - role: 'authenticated'
   - exp: expiration timestamp

3. Client stores JWT in localStorage (handled by Supabase client)

4. Every API request includes: Authorization: Bearer <JWT>

5. PostgreSQL validates JWT and exposes via auth.uid()

6. RLS policies use auth.uid() to filter/validate queries
```

## Component Architecture

### Page Components (Routes)

- **Landing** (`/`): Marketing page, auth redirect logic
- **Onboarding** (`/onboarding`): Multi-step wizard, creates profile + preferences
- **HomeFeed** (`/app`): Main app, shows activities + suggestions
- **Profile** (`/profile`): Edit user preferences and settings

### Reusable Components

- **ActivityTile**: Displays a friend's activity with metadata
- **SuggestionTile**: Displays AI-generated suggestion
- **CreateActivityModal**: Full activity creation flow with template selection

### State Management

Currently using React component state (`useState`) and `useEffect` for data fetching. No global state management.

For future scalability, consider:
- **React Context** for auth state
- **Zustand** for global app state
- **TanStack Query** for server state caching

## Database Schema Design

### Time Frame Implementation

Activities use an enum `time_frame_type`:
- `now`: User is doing this right now
- `scheduled`: Has a specific `scheduled_at` timestamp
- `someday`: Future plan without specific date

Constraints enforce:
```sql
-- Scheduled activities must have a timestamp
CHECK (
  (time_frame_type = 'scheduled' AND scheduled_at IS NOT NULL) OR
  (time_frame_type != 'scheduled')
)

-- Scheduled activities must be within 30 days
CHECK (
  (time_frame_type != 'scheduled') OR
  (scheduled_at <= now() + interval '30 days')
)
```

### Friendship Model

Friendships are undirected:
```sql
CONSTRAINT unique_friendship UNIQUE (
  LEAST(user_id, friend_id),
  GREATEST(user_id, friend_id)
)
```

This prevents duplicate friendships like:
- (A, B) and (B, A) both existing

Status field supports:
- `pending`: Invitation sent, awaiting acceptance
- `accepted`: Active friendship
- `blocked`: User has blocked the other

## Type Safety

### Database Types

`src/types/database.ts` defines Supabase table shapes:
- `Row`: What you get when reading
- `Insert`: What you need when inserting
- `Update`: What you can update

### Domain Types

`src/types/index.ts` defines app-level types:
- Match database structure but with app-specific additions
- Include extended types like `ActivityWithProfile`
- Support frontend-only types like `SuggestionTile`

### Type Flow

```
Database → Supabase client (typed) → Domain types → Component props
```

Example:
```typescript
// Database query (typed)
const { data } = await supabase
  .from('activities')
  .select('*, profile:profiles(*)')

// Cast to domain type
const activities = data as ActivityWithProfile[]

// Pass to component (type-safe)
<ActivityTile activity={activity} />
```

## Build & Deployment

### Development

```bash
npm run dev  # Vite dev server with HMR
```

- Vite serves at localhost:5173
- Hot Module Replacement (HMR) for fast feedback
- Source maps for debugging

### Production Build

```bash
npm run build  # TypeScript check + Vite build
```

1. `tsc`: Type checks all files (no emit)
2. `vite build`: Bundles app to `dist/`
   - Code splitting by route
   - Asset optimization
   - CSS extraction
   - Tree shaking

### Deployment

Static files in `dist/` can be deployed to:
- **Netlify**: Auto-deploy from Git, supports SPA routing
- **Vercel**: Similar to Netlify
- **Cloudflare Pages**: Fast global CDN
- Any static host with SPA routing support

Required environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Performance Considerations

### Current Implementation

- Direct Supabase calls (no caching)
- Component-level loading states
- No pagination (limits to 20 items)
- No optimistic updates

### Future Optimizations

1. **Caching**: Add TanStack Query for smart caching
2. **Pagination**: Implement infinite scroll or cursor pagination
3. **Optimistic UI**: Update UI before server confirms
4. **Subscriptions**: Use Supabase Realtime for live updates
5. **Image optimization**: Add CDN, lazy loading, responsive images
6. **Code splitting**: Lazy load routes and modals

## Extensibility Points

### Adding Features

**Friend Management**:
- UI to send/accept friend requests
- Uses existing `friendships` table
- Update RLS policies if needed

**In-App Messaging**:
- Add `messages` table
- Real-time via Supabase Realtime
- RLS: only parties involved can read

**Weekly Digest**:
- Use existing `weekly_digest_settings`
- Add serverless function (Supabase Edge Functions)
- Cron job to send emails

**Push Notifications**:
- Add `push_subscriptions` table
- Web Push API for browser notifications
- Supabase Edge Function for sending

### API Layer

Currently using direct Supabase calls. To add API layer:

1. Create Supabase Edge Functions
2. Move business logic to functions
3. Keep RLS as security backup
4. Add caching, rate limiting, etc.

Benefits:
- Complex queries without exposing to client
- Server-side validation
- Integration with external APIs
- Better error handling

## Development Guidelines

### Adding a New Table

1. Create migration SQL in `supabase/migrations/`
2. Define RLS policies in same migration
3. Add types to `src/types/database.ts`
4. Create domain type in `src/types/index.ts`
5. Add queries in relevant components

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation links
4. Implement auth guards if needed

### Adding a New Component

1. Create file in `src/components/`
2. Define TypeScript props interface
3. Export as default
4. Use in page components

### Database Changes

For schema changes:
1. Never modify existing migrations
2. Create new migration file
3. Use ALTER TABLE commands
4. Test locally before production
5. Run in production Supabase SQL editor

## Troubleshooting

### Common Issues

**Auth not working**:
- Check Supabase URL/key in `.env`
- Verify email provider is enabled
- Check redirect URLs in Supabase dashboard

**RLS blocking queries**:
- Check policies in Supabase dashboard
- Verify user is authenticated
- Look at PostgreSQL logs in Supabase

**Type errors**:
- Run `npx tsc --noEmit` to see all errors
- Check database types match domain types
- Ensure proper type casting from Supabase queries

**Build fails**:
- Check all imports are correct
- Verify all dependencies installed
- Look for TypeScript strict mode issues
