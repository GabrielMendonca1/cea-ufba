"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Editor from '@/components/posts/BlockNoteEditor'
import { Loader2 } from "lucide-react"
import { createClient } from '@/utils/supabase/client'
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { v4 as uuidv4 } from 'uuid' // For generating temporary IDs

interface ScientificOutreachPost {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  professor_id: string
  user_profiles: {
    full_name: string | null
    email: string
    department: string | null
  } | null
  posts: {
    content: string
  } | null
}

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // We don't need the data from useRealtimeTable here, just the setter to optimistically update
  const [, setScientificOutreachPosts] = useRealtimeTable<ScientificOutreachPost>('scientific_outreach', [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/sign-in')
        return
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()

      if (error || profile?.user_type !== 'professor') {
        router.replace('/dashboard')
      } else {
        setIsLoading(false)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      alert('Por favor, preencha todos os campos.')
      return
    }

    setIsSubmitting(true)

    // Get current user ID first
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Usuário não autenticado')
      setIsSubmitting(false)
      return
    }

    const tempId = uuidv4() // Generate a temporary ID for optimistic UI
    const now = new Date().toISOString()

    // Optimistic update
    const optimisticPost: ScientificOutreachPost = {
      id: tempId,
      title: title.trim(),
      description: description.trim(),
      created_at: now,
      updated_at: now,
      professor_id: user.id,
      user_profiles: {
        full_name: 'Você (otimista)',
        email: '',
        department: '',
      },
      posts: {
        content: content.trim(),
      },
    }

    // Add the optimistic post to the real-time state
    setScientificOutreachPosts(prev => [optimisticPost, ...prev])

    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          content_json: content.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Real-time hook will handle the actual update/replacement
        router.push('/dashboard/posts')
      } else {
        // Revert optimistic update on error
        setScientificOutreachPosts(prev => prev.filter(post => post.id !== tempId))
        alert(data.error || 'Erro ao criar post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      // Revert optimistic update on error
      setScientificOutreachPosts(prev => prev.filter(post => post.id !== tempId))
      alert('Erro inesperado ao criar post')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-white">
      <div className="fixed top-4 right-4 z-10 flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Voltar
        </Button>
        <Button variant="ghost" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publicando...
            </>
          ) : (
            'Publicar'
          )}
        </Button>
      </div>

      <main className="flex justify-center">
        <div className="w-full max-w-4xl px-8 pt-24 pb-12">
          <Textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            disabled={isSubmitting}
            className="text-5xl font-extrabold border-none shadow-none focus-visible:ring-0 resize-none p-0 tracking-tight"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comece com uma descrição cativante..."
            disabled={isSubmitting}
            className="text-xl text-gray-500 border-none shadow-none focus-visible:ring-0 resize-none h-auto p-0 my-4"
            rows={1}
          />
          <div className="mt-8">
            <Editor
              onChange={setContent}
              initialContent=""
              editable={!isSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  )
}