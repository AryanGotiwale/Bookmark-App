# Smart Bookmark App

A real-time bookmark manager with Google OAuth authentication, built with Next.js, Supabase, and Tailwind CSS.

## Features

✅ **Google OAuth Authentication** - Sign in with Google (no email/password required)  
✅ **Add Bookmarks** - Save URLs with custom titles  
✅ **Private Bookmarks** - Each user can only see their own bookmarks  
✅ **Real-time Updates** - Changes sync instantly across all open tabs  
✅ **Delete Bookmarks** - Remove bookmarks you no longer need  
✅ **Deployed on Vercel** - Production-ready with live URL  

## Tech Stack

- **Next.js 14** (App Router)
- **Supabase** (Authentication, Database, Realtime)
- **Tailwind CSS** (Styling)
- **TypeScript**

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)

2. In the SQL Editor, run this SQL to create the bookmarks table:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own bookmarks
CREATE POLICY "Users can insert their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Create policy: Users can update their own bookmarks
CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

3. Enable Google OAuth:
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add your Google OAuth credentials (Client ID & Secret)
   - Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 2. Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bookmark-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase Dashboard → Project Settings → API

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy!

5. Update Google OAuth settings:
   - Add your Vercel domain to authorized domains in Google Cloud Console
   - Add Vercel URL to Supabase redirect URLs

## Problems Encountered & Solutions

### Problem 1: Real-time Synchronization Across Tabs
**Challenge:** Needed bookmarks to update instantly when added/deleted in another tab without manual refresh.

**Solution:** Implemented Supabase Realtime subscriptions using `postgres_changes` events. The app listens for INSERT, DELETE, and UPDATE events on the bookmarks table and updates the local state immediately, providing seamless cross-tab synchronization.

### Problem 2: Google OAuth Configuration
**Challenge:** Setting up Google OAuth with proper redirect URLs for both local development and production.

**Solution:** Used Supabase's built-in OAuth handling which manages redirect URLs automatically. Configured the redirect URL dynamically using `window.location.origin` to work in both environments.

### Problem 3: Row-Level Security (RLS)
**Challenge:** Ensuring users can only see and modify their own bookmarks while maintaining security.

**Solution:** Implemented Supabase Row Level Security policies that filter all queries by `user_id`, ensuring complete data isolation between users. Each policy checks that `auth.uid() = user_id` before allowing any operation.

### Problem 4: Real-time Performance
**Challenge:** Avoiding duplicate updates when the user who made the change also receives the real-time event.

**Solution:** The real-time subscription handles this gracefully by updating the state with the new data from the server, ensuring consistency. The optimistic UI approach means users see instant feedback while the subscription confirms the change.

### Problem 5: Type Safety with Supabase
**Challenge:** Maintaining TypeScript type safety with Supabase queries and real-time events.

**Solution:** Defined clear TypeScript interfaces for the Bookmark type and used proper typing for all Supabase operations, ensuring compile-time safety and better developer experience.

## Project Structure

```
bookmark-app/
├── app/
│   ├── page.tsx          # Main page with bookmark manager
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── Auth.tsx          # Google OAuth sign-in
│   ├── AddBookmark.tsx   # Form to add bookmarks
│   └── BookmarkList.tsx  # List with real-time updates
├── lib/
│   └── supabase.ts       # Supabase client
└── package.json
```

## Testing

To test the app:

1. Sign in with your Google account
2. Add a bookmark with a URL and title
3. Open the app in another tab - the bookmark should appear instantly
4. Delete a bookmark - it should disappear in all tabs immediately
5. Sign out and sign in with a different Google account - you should see a different set of bookmarks

## License

MIT
