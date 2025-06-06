"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Editor from '@/components/posts/BlockNoteEditor'
import { Loader2, ArrowLeft } from "lucide-react"
import { createClient } from '@/utils/supabase/client'

export default function CreatePostPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

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

      if (data.success) {
        router.push('/dashboard')
        router.refresh()
      } else {
        alert(data.error || 'Erro ao criar post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
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