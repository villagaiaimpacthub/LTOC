# Supabase Setup Guide for LTOC Platform

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or create an account
4. Click "New project"
5. Fill in:
   - **Organization**: Select or create one
   - **Project name**: `ltoc-platform` 
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

## 2. Wait for Project Setup
- This takes 1-2 minutes
- You'll see a loading screen while Supabase provisions your database

## 3. Get Your API Keys

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret**: This is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## 4. Run Database Migrations

### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
cd /mnt/c/Users/julia/DEV/LTOC
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push
```

### Option B: Using SQL Editor in Dashboard
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy the contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste and run the query
5. Repeat for each migration file in order

## 5. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable the providers you want:
   - **Email**: Already enabled by default
   - **Google**: Add your OAuth credentials
   - **GitHub**: Add your OAuth credentials

3. Go to **Authentication** → **URL Configuration**
4. Add your production URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: 
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

## 6. Set Up Storage (Optional)

If you plan to use file uploads:

1. Go to **Storage**
2. Create a new bucket called `content-assets`
3. Set it to "Public bucket" if you want public access
4. Update RLS policies as needed

## 7. Configure Row Level Security (RLS)

The migrations already include RLS policies, but verify they're enabled:

1. Go to **Table Editor**
2. For each table, click the shield icon
3. Ensure "RLS enabled" is turned on

## 8. Create Your First Admin User

1. Go to **Authentication** → **Users**
2. Click "Invite user"
3. Enter your email
4. After confirming, update their role:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

## 9. Test Your Connection

Create a `.env.local` file in `/apps/web/`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Run locally to test:
```bash
cd apps/web
npm run dev
```

## 🎉 Your Supabase backend is ready!

### Next Steps:
1. Add these environment variables to Vercel
2. Deploy your application
3. Monitor usage in Supabase dashboard
4. Set up database backups (in Production plan)

### Useful Links:
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Database Schema](/supabase/migrations/001_initial_schema.sql)