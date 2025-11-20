# Kisloty - Quick Start Guide

Get Kisloty running locally in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step 1: Install Dependencies (1 min)

```bash
npm install
```

## Step 2: Set Up Supabase (3 mins)

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "kisloty-dev")
4. Set a database password (save it somewhere!)
5. Choose a region close to you
6. Wait for project to finish setting up (~2 minutes)

### Get Your Credentials

1. In your project dashboard, click **Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy these two values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

### Configure Environment

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your credentials:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Run Database Migrations (3 mins)

### Enable Email Auth

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)

### Run Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `supabase/migrations/001_initial_schema.sql` in your code editor
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** (bottom right)
7. You should see "Success. No rows returned"

8. Repeat for `002_rls_policies.sql`:
   - New Query
   - Copy/paste contents
   - Run

### Verify Tables Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - profiles
   - activities
   - activity_templates (should have ~20 rows)
   - preferences
   - friendships
   - weekly_digest_settings

## Step 4: Start the App (1 min)

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Step 5: Test the Flow (2 mins)

### First Time Setup

1. **Landing page** should load
2. Click **"Get started"**
3. Enter your email address
4. Check your email for the magic link
5. Click the magic link
6. You'll be redirected to the **Onboarding** flow

### Complete Onboarding

1. Enter your city (e.g., "London")
2. Select how much time you typically have
3. Click through the questions
4. Select some favorite hobbies
5. Click **"Go to Home Feed"**

### Explore the App

1. **Home Feed**:
   - You should see a suggestion tile
   - Click **"Start a small thing"** (bottom right button)

2. **Create Activity**:
   - Click an emoji template (e.g., Coffee ☕)
   - Choose a time frame:
     - "Now" for immediate
     - "Pick a date" for scheduled
     - "Sometime in the future" for someday
   - Add a location (optional)
   - Click **"Create activity"**

3. **Profile**:
   - Click your avatar (top right)
   - Edit your display name
   - Toggle favorite activities
   - Add bucket list items
   - Click **"Done"** to save

## Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env` file exists in project root
- Check that variables start with `VITE_`
- Restart dev server after creating `.env`

### "Magic link doesn't work"

- Check your spam folder
- Make sure email provider is enabled in Supabase
- Verify redirect URL includes `http://localhost:5173`

### "Can't see created activities"

- Check browser console for errors
- Verify RLS policies were applied (002_rls_policies.sql)
- Make sure you're logged in (check Supabase Auth dashboard)

### "Table doesn't exist"

- Verify migrations ran successfully in SQL Editor
- Check for error messages in Supabase SQL output
- Try running migrations again

### TypeScript errors

```bash
# Check for type errors
npx tsc --noEmit
```

## Next Steps

### Add Test Data

To see friend activities, you need to:
1. Create a second account with different email
2. Manually add a friendship in Supabase Table Editor:
   - Go to `friendships` table
   - Insert row with:
     - `user_id`: your first user's UUID
     - `friend_id`: your second user's UUID
     - `status`: 'accepted'
3. Create activities as the second user
4. Refresh feed as first user

### Customize

- Edit colors in `tailwind.config.js`
- Modify activity templates in `001_initial_schema.sql`
- Add new features to pages
- Extend database schema with new migrations

### Deploy

See `README.md` for deployment instructions to Netlify or Vercel.

## Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Type checking
npx tsc --noEmit        # Check types without building

# Build
npm run build           # Build for production
npm run preview         # Preview production build locally

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Getting Help

- Check `README.md` for detailed documentation
- See `ARCHITECTURE.md` for technical details
- Review `SETUP_SUMMARY.md` for what's been built

## What's Working

✅ Email authentication with magic links
✅ Onboarding flow that saves preferences
✅ Activity creation with 3 time modes
✅ Smart suggestions based on context
✅ Profile editing
✅ Database with RLS security
✅ Responsive design
✅ Dark mode support

Enjoy building with Kisloty! 🎉
