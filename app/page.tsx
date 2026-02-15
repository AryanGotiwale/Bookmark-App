'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import BookmarkList from '@/components/BookmarkList'
import AddBookmark from '@/components/AddBookmark'
import Auth from '@/components/Auth'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Check current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleBookmarkAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Bookmarks</h1>
              <p className="text-slate-500 mt-1 text-sm">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-slate-600 hover:text-slate-900 underline decoration-slate-300 hover:decoration-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-300 to-transparent mt-4"></div>
        </div>

        {/* Add Bookmark Section */}
        <div className="mb-8 bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Add new bookmark</h2>
          <AddBookmark userId={user.id} onBookmarkAdded={handleBookmarkAdded} />
        </div>

        {/* Bookmarks List */}
        <BookmarkList userId={user.id} refreshTrigger={refreshTrigger} />
      </div>
    </div>
  )
}