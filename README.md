# Smart Bookmark App

A real-time bookmark manager with Google OAuth authentication, built with Next.js and Supabase.

**Live Demo:** [Your Vercel URL]  
**Repository:** https://github.com/AryanGotiwale/Bookmark-App

## Features

- 🔐 Google OAuth authentication (no passwords)
- 📚 Add and delete bookmarks with URL + title
- 🔒 Private bookmarks per user (Row Level Security)
- ⚡ Real-time sync across browser tabs
- 📱 Responsive, minimal design
- 🚀 Deployed on Vercel

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Realtime)
- **Deployment:** Vercel

## Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/AryanGotiwale/Bookmark-App.git
cd Bookmark-App
npm install
```

### 2. Set Up Supabase

Create a Supabase project and run this SQL:

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

### 3. Configure Google OAuth

1. Create OAuth client in [Google Cloud Console](https://console.cloud.google.com)
2. Add redirect URI: `https://[your-project].supabase.co/auth/v1/callback`
3. Enable Google provider in Supabase Authentication
4. Add Client ID and Secret

### 4. Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Run
```bash
npm run dev
```

## Problems Encountered & Solutions

### 1. Real-time Sync Across Tabs

**Problem:** WebSocket connections failed intermittently, preventing cross-tab updates.

**Solution:** Implemented a hybrid approach:
- Primary: Supabase Realtime (WebSocket)
- Fallback: localStorage events for cross-tab communication

```typescript
// Trigger on bookmark add/delete
localStorage.setItem('bookmark-update', Date.now().toString())

// Listen in other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'bookmark-update') fetchBookmarks()
})
```

**Result:** Reliable cross-tab sync regardless of WebSocket status.

---

### 2. TypeScript Build Errors on Vercel

**Problem:** Local build succeeded, but Vercel deployment failed with TypeScript errors:
```
Type error: Parameter 'payload' implicitly has an 'any' type
```

**Solution:** Added explicit type annotations for all callback parameters:

```typescript
// Before
supabase.auth.getSession().then(({ data: { session } }) => {

// After  
supabase.auth.getSession().then(({ data }: { data: any }) => {
```

**Result:** Successful builds in both development and production.

---

### 3. Row Level Security Implementation

**Problem:** Needed to ensure users can only access their own bookmarks at the database level, not just client-side filtering.

**Solution:** Implemented PostgreSQL Row Level Security (RLS) policies:

```sql
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**How it works:** Supabase's `auth.uid()` function returns the current user's ID from their JWT token. All database queries are automatically filtered by this policy at the PostgreSQL level, making it impossible to bypass from the client.

**Result:** Complete data isolation - users cannot access other users' bookmarks even with direct API calls.

---

### 4. Google OAuth Configuration

**Problem:** OAuth redirect mismatches between development and production environments.

**Solution:** Proper URL configuration understanding:

**Flow:** User clicks login → Google → Supabase callback → Your app

**Google Cloud Console:**
- Authorized origins: `http://localhost:3001`, `https://your-app.vercel.app`
- Redirect URI: `https://[project].supabase.co/auth/v1/callback` (Supabase handles this)

**Supabase:**
- Site URL: Your production domain
- Redirect URLs: `http://localhost:3001/**`, `https://your-app.vercel.app/**`

**Result:** Seamless OAuth flow in both environments.

---

### 5. UI Responsiveness (Optimistic Updates)

**Problem:** 1-2 second delay after adding/deleting bookmarks made the app feel slow.

**Solution:** Optimistic UI updates - update the UI immediately, then sync with database:

```typescript
const handleDelete = async (id: string) => {
  // Immediate UI update
  setBookmarks(current => current.filter(b => b.id !== id))
  
  // Then database delete
  await supabase.from('bookmarks').delete().eq('id', id)
}
```

**Result:** App feels instant and responsive.

---

## Architecture

```
┌──────────────┐
│   Next.js    │ ← User Interface
│   (Vercel)   │
└──────┬───────┘
       │
       ├── Google OAuth
       │
       ▼
┌──────────────┐
│   Supabase   │
├──────────────┤
│ • Auth       │
│ • PostgreSQL │
│ • Realtime   │
│ • RLS        │
└──────────────┘
```

**Why no custom backend?** Supabase provides everything: authentication, database, real-time subscriptions, and auto-generated REST APIs. No need for Express/Railway/Render.

## Key Learnings

1. **Database-level security (RLS) is essential** - client-side filtering can be bypassed
2. **Always have fallbacks** - WebSocket can fail, localStorage events work reliably
3. **Production builds are stricter** - explicit TypeScript types prevent deployment failures
4. **Optimistic UI makes apps feel fast** - update UI immediately, sync in background
5. **BaaS eliminates backend complexity** - Supabase handles auth, database, and real-time

## Project Structure

```
├── app/
│   ├── page.tsx          # Main app page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Styles
├── components/
│   ├── Auth.tsx          # Google sign-in
│   ├── AddBookmark.tsx   # Add form
│   └── BookmarkList.tsx  # List with real-time
└── lib/
    └── supabase.ts       # Supabase client
```

## Testing

**Cross-tab sync:**
1. Open app in two tabs
2. Add bookmark in Tab 1 → appears in Tab 2 (within 2s)
3. Delete in Tab 2 → disappears from Tab 1

**Privacy:**
1. Sign in with Google Account A
2. Add bookmarks
3. Sign out, sign in with Account B
4. Account A's bookmarks are not visible ✓

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy
5. Update Google OAuth and Supabase with Vercel URL

## Author

**Aryan Gotiwale**
- GitHub: [@AryanGotiwale](https://github.com/AryanGotiwale)
- Email: ggotiwale@gmail.com

## License

MIT License - feel free to use this project for learning or building upon.

---

Built with Next.js, Supabase