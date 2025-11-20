# Supabase Database Setup

Your Supabase project is ready! Now you need to run the database migrations.

## Project Details

- **Project URL**: https://jzlggifgziejvlnfnxvu.supabase.co
- **Project ID**: jzlggifgziejvlnfnxvu

## Step 1: Enable Email Authentication

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/jzlggifgziejvlnfnxvu
2. Click **Authentication** in the left sidebar
3. Click **Providers**
4. Make sure **Email** is enabled (should be by default)

## Step 2: Configure Redirect URLs

1. In the left sidebar, click **Authentication**
2. Click **URL Configuration**
3. Under "Redirect URLs", add these:
   - `http://localhost:5173/**` (for local development)
   - Your production URL when you deploy (e.g., `https://kisloty.netlify.app/**`)

## Step 3: Run Database Migrations

### Migration 1: Initial Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (bottom right green button)
6. You should see: "Success. No rows returned"

This creates:
- All database tables (profiles, activities, activity_templates, preferences, friendships, weekly_digest_settings)
- Constraints and relationships
- Indexes for performance
- 20 pre-seeded activity templates

### Migration 2: RLS Policies

1. Click **New Query** again
2. Copy the entire contents of `supabase/migrations/002_rls_policies.sql`
3. Paste into the SQL Editor
4. Click **Run**
5. You should see: "Success. No rows returned"

This sets up:
- Row Level Security on all tables
- Policies that ensure users can only see their own data
- Friend activity visibility when friendship status is 'accepted'

## Step 4: Verify Setup

### Check Tables

1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `profiles`
   - `activities`
   - `activity_templates` ← Should have ~20 rows
   - `preferences`
   - `friendships`
   - `weekly_digest_settings`

### Check Activity Templates

1. Click on `activity_templates` table
2. You should see templates like:
   - Grab a coffee ☕ (micro)
   - Quick walk 🚶 (micro)
   - Cinema 🎬 (hobby)
   - Visit a market 🛍️ (hobby)
   - etc.

## Step 5: Test the Connection

Your `.env` file is already configured with:
```
VITE_SUPABASE_URL=https://jzlggifgziejvlnfnxvu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (your key)
```

Run the app to test:
```bash
npm run dev
```

Visit `http://localhost:5173` and:
1. Click "Get started"
2. Enter your email
3. Check your email for the magic link
4. Complete the onboarding flow

If everything works, you're all set! 🎉

## Troubleshooting

### "Auth error" or "No rows returned" when creating profile

- Check that migration 001 ran successfully
- Verify the `profiles` table exists
- Check that RLS policies were applied (migration 002)

### Magic link email not arriving

- Check spam folder
- Verify email provider is enabled in Authentication > Providers
- Check that redirect URLs are configured correctly

### "Relation does not exist" errors

- Migration 001 didn't run successfully
- Try running it again in SQL Editor
- Check for any error messages in the SQL output

### Can't see created activities

- Check that RLS policies were applied (migration 002)
- Verify you're logged in (check Supabase Auth users list)
- Check browser console for errors

## Security Note

**IMPORTANT**: The database password and API keys I was given should be treated as secrets. Consider:

1. **Rotating your database password** in Supabase Settings > Database
2. **Never committing secrets** to Git (they're already in `.gitignore`)
3. **Using environment variables** in production (Netlify/Vercel handle this)

## Next Steps

Once the database is set up:
1. Push code to GitHub
2. Deploy to Netlify or Vercel
3. Add production URL to Supabase redirect URLs
4. Start building features!

See `README.md` for full documentation.
