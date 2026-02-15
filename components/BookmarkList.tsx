'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface Bookmark {
  id: string
  title: string
  url: string
  created_at: string
  user_id: string
}

interface BookmarkListProps {
  userId: string
  refreshTrigger?: number
}

export default function BookmarkList({ userId, refreshTrigger }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Refetch when refreshTrigger changes (manual refresh)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchBookmarks()
    }
  }, [refreshTrigger])

  useEffect(() => {
    fetchBookmarks()

    // Set up real-time subscription (WebSocket)
    const channel: RealtimeChannel = supabase
      .channel('bookmarks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('Realtime event received:', payload)
          if (payload.eventType === 'INSERT') {
            setBookmarks((current) => [payload.new as Bookmark, ...current])
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((current) =>
              current.filter((bookmark) => bookmark.id !== payload.old.id)
            )
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((current) =>
              current.map((bookmark) =>
                bookmark.id === payload.new.id ? (payload.new as Bookmark) : bookmark
              )
            )
          }
        }
      )
      .subscribe((status: any) => {
        console.log('Realtime subscription status:', status)
      })

    // Fallback: Listen for storage events (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmark-update' && e.newValue) {
        console.log('Cross-tab update detected via localStorage')
        fetchBookmarks()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userId])

  const fetchBookmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookmarks(data || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('bookmarks').delete().eq('id', id)

      if (error) throw error
      
      // Immediately update the UI
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id))
      
      // Notify other tabs
      localStorage.setItem('bookmark-update', Date.now().toString())
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      alert('Error deleting bookmark')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-slate-300 border-r-transparent"></div>
        <p className="text-slate-600 text-sm mt-3">Loading your bookmarks...</p>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <p className="text-slate-600 text-sm">No bookmarks yet</p>
        <p className="text-slate-500 text-xs mt-1">Add your first one above</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-900">
          Your bookmarks <span className="text-slate-500 font-normal text-sm">({bookmarks.length})</span>
        </h2>
      </div>
      
      <div className="space-y-2">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="bookmark-card group p-4 flex items-start justify-between gap-4"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-slate-900 text-sm mb-1 truncate">
                {bookmark.title}
              </h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-xs truncate block mb-1.5"
              >
                {bookmark.url}
              </a>
              <p className="text-xs text-slate-500">
                {new Date(bookmark.created_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(bookmark.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-all text-xs px-3 py-1.5 border border-slate-200 hover:border-red-200 rounded-md"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}