"use client"

import { useEffect, useState } from 'react'
import BlockNoteViewer from '@/components/posts/BlockNoteViewer'
import { notFound } from 'next/navigation'
import { Calendar, User, BookOpen } from 'lucide-react'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { createClient } from '@/utils/supabase/client'
import { professorLoading } from '@/components/ui/professor-loading'

interface PostData {
  id: string
  title: string
  description: string
  created_at: string
  user_profiles: {
    full_name: string | null
    email: string
    department: string | null
  } | null
  posts: {
    content: string
  } | null
}

export default function PostPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [post, setPost] = useState<PostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // Use useRealtimeTable to get real-time updates for scientific_outreach
  const [allOutreach] = useRealtimeTable<PostData>('scientific_outreach', [])

  useEffect(() => {
    if (allOutreach.length > 0) {
      const foundPost = allOutreach.find((item) => item.id === id)
      if (foundPost) {
        setPost(foundPost)
        setIsLoading(false)
      } else {
        setIsError(true) // Post not found in real-time data
        setIsLoading(false)
      }
    } else if (!isLoading && !post) {
      // If no real-time data yet, try to fetch once
      const fetchInitialPost = async () => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('scientific_outreach')
          .select(
            `
            id,
            title,
            description,
            created_at,
            user_profiles (
              full_name,
              email,
              department
            ),
            posts (
              content
            )
          `
          )
          .eq('id', id)
          .single()

        if (error || !data) {
          setIsError(true)
        } else {
          setPost({
            ...data,
            user_profiles: Array.isArray(data.user_profiles) ? data.user_profiles[0] : data.user_profiles,
            posts: Array.isArray(data.posts) ? data.posts[0] : data.posts,
          } as PostData)
        }
        setIsLoading(false)
      }
      fetchInitialPost()
    }
  }, [allOutreach, id, isLoading, post])

  if (isLoading) {
    return professorLoading()
  }

  if (isError || !post) {
    notFound()
  }

  const author = post.user_profiles

  return (
    <article className="max-w-5xl mx-auto py-8 px-4">
      <header className="mb-8 border-b pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">{post.title}</h1>
        <p className="text-xl text-gray-600">{post.description}</p>
        <div className="mt-6 flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{author?.full_name || author?.email}</span>
          </div>
          {author?.department && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{author.department}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(post.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        {post.posts?.content && <BlockNoteViewer content={post.posts.content} />}
      </div>
    </article>
  )
}