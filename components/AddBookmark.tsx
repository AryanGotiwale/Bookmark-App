'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface AddBookmarkProps {
  userId: string
  onBookmarkAdded?: () => void
}

export default function AddBookmark({ userId, onBookmarkAdded }: AddBookmarkProps) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url || !title) {
      alert('Please enter both URL and title')
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([
          {
            url,
            title,
            user_id: userId,
          },
        ])
        .select()

      if (error) throw error

      setUrl('')
      setTitle('')
      
      // Notify other tabs
      localStorage.setItem('bookmark-update', Date.now().toString())
      
      onBookmarkAdded?.() // Trigger refresh
    } catch (error) {
      console.error('Error adding bookmark:', error)
      alert('Error adding bookmark')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-xs font-medium text-slate-700 mb-1.5">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My awesome site"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label htmlFor="url" className="block text-xs font-medium text-slate-700 mb-1.5">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Adding...' : 'Add bookmark'}
      </button>
    </form>
  )
}