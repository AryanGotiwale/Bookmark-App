# Deployment Guide - Smart Bookmark App

This guide will walk you through deploying the Smart Bookmark App to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works fine)
- Supabase account (free tier works fine)
- Google Cloud Console account (for OAuth)

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `bookmark-app` (or your preference)
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project" (takes ~2 minutes)

### 1.2 Set Up Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Setup complete!" message

### 1.3 Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted:
   - User Type: External
   - App name: Smart Bookmark App
   - User support email: your email
   - Developer contact: your email
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: Smart Bookmark App
   - Authorized redirect URIs: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
     (Replace [YOUR-PROJECT] with your Supabase project reference)
7. Copy your **Client ID** and **Client Secret**

8. In Supabase dashboard, go to **Authentication** → **Providers**
9. Find **Google** and toggle it on
10. Paste your Client ID and Client Secret
11. Click **Save**

### 1.4 Get API Keys

1. In Supabase dashboard, go to **Project Settings** → **API**
2. Copy these values (you'll need them later):
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon` `public` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 2: Prepare Code

### 2.1 Initialize Git Repository

```bash
cd bookmark-app
git init
git add .
git commit -m "Initial commit: Smart Bookmark App"
```

### 2.2 Push to GitHub

1. Create a new repository on GitHub (don't initialize with README)
2. Copy the repository URL
3. Run:

```bash
git remote add origin https://github.com/YOUR-USERNAME/bookmark-app.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3.2 Configure Environment Variables

Before deploying, add these environment variables:

1. Click **Environment Variables**
2. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = [your Supabase project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your Supabase anon key]
```

3. Make sure they're available for **Production**, **Preview**, and **Development**

### 3.3 Deploy

1. Click **Deploy**
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like `https://bookmark-app-xyz.vercel.app`

## Step 4: Update OAuth Settings

### 4.1 Update Google Cloud Console

1. Go back to Google Cloud Console
2. Navigate to your OAuth client
3. Add your Vercel URL to **Authorized JavaScript origins**:
   - `https://bookmark-app-xyz.vercel.app`
4. Add to **Authorized redirect URIs**:
   - `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
5. Save changes

### 4.2 Update Supabase

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**:
   - `https://bookmark-app-xyz.vercel.app`
3. Add to **Redirect URLs**:
   - `https://bookmark-app-xyz.vercel.app/**`
4. Save changes

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Authorize the app
4. Add a bookmark
5. Open the app in another tab/browser
6. Verify real-time sync works
7. Test delete functionality

## Troubleshooting

### "Invalid redirect URI" error
- Make sure you added your Vercel URL to Google Cloud Console
- Check that Supabase redirect URLs include your Vercel domain
- Wait a few minutes for changes to propagate

### Bookmarks not showing
- Check browser console for errors
- Verify environment variables are set correctly in Vercel
- Make sure RLS policies are enabled (run the SQL schema again)

### Real-time not working
- Verify `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;` was executed
- Check that you're signed in as the same user in all tabs
- Check browser console for WebSocket errors

### "Failed to fetch" errors
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is running (not paused)
- Ensure CORS settings in Supabase allow your Vercel domain

## Success!

Your Smart Bookmark App should now be live! 🎉

Share your deployment URL in the README or submit it as requested.

## Optional: Custom Domain

To use a custom domain:

1. In Vercel dashboard, go to your project
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Update Google OAuth and Supabase settings with new domain

## Monitoring

- **Vercel Analytics**: Automatically enabled for page views
- **Supabase Logs**: Check **Logs** tab in Supabase dashboard
- **Error Tracking**: Check Vercel deployment logs for any issues
