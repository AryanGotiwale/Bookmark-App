# Quick Start Guide

Get the Smart Bookmark App running in 5 minutes!

## 1. Create Supabase Project (2 min)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in details and click **Create**
4. While it sets up, continue to step 2

## 2. Set Up Google OAuth (2 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth client ID**
4. Choose **Web application**
5. Get your Supabase URL from the dashboard (it's ready now!)
6. Add redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
7. Copy **Client ID** and **Client Secret**

## 3. Configure Supabase (1 min)

1. In Supabase: **SQL Editor** → **New Query**
2. Paste contents of `supabase-schema.sql` and run it
3. Go to **Authentication** → **Providers** → **Google**
4. Toggle on, paste Client ID/Secret, save
5. Go to **Settings** → **API** and copy:
   - Project URL
   - anon public key

## 4. Deploy to Vercel (Free!) (1 min)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. **Import** your repository
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
5. Click **Deploy**

## 5. Final Configuration (30 sec)

1. Copy your Vercel URL (e.g., `bookmark-app-xyz.vercel.app`)
2. Add it to Google Cloud Console → Authorized origins
3. Add it to Supabase → Authentication → Redirect URLs

## Done! 🎉

Visit your Vercel URL and start bookmarking!

## Testing Checklist

- [ ] Can sign in with Google
- [ ] Can add a bookmark
- [ ] Bookmark appears in list
- [ ] Open in new tab → bookmark syncs instantly
- [ ] Can delete bookmark
- [ ] Deletion syncs across tabs
- [ ] Sign out and sign in with different account → separate bookmarks

---

**Need help?** Check the detailed [DEPLOYMENT.md](DEPLOYMENT.md) guide.
