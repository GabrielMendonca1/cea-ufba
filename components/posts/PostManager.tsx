"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Calendar, User, BookOpen } from "lucide-react"
import { CreatePostModal } from '@/components/posts/CreatePostModal'

interface Post {
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
    research_area: string | null
    avatar_url: string | null
  } | null
  posts: {
    id: string
    content_markdown: string
    created_at: string
    updated_at: string
  } | null
}

interface PostManagerProps {
  userId: string
}

export function PostManager({ userId }: PostManagerProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      if (data.success) {
        setPosts(data.posts)
      } else {
        console.error('Failed to fetch posts:', data.error)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePostCreated = () => {
    fetchPosts() // Refresh the posts list
    setIsCreateModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Posts Científicos</h3>
        </div>
        <div>Carregando posts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Posts Científicos</h3>
        <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Criar Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum post encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Comece compartilhando conhecimento científico com a comunidade acadêmica.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Criar Primeiro Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {post.description}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    Científico
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Post content preview */}
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {post.posts?.content_markdown?.substring(0, 200)}
                    {post.posts?.content_markdown && post.posts.content_markdown.length > 200 && '...'}
                  </div>
                  
                  {/* Author and date info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.user_profiles?.full_name || post.user_profiles?.email}</span>
                      </div>
                      {post.user_profiles?.department && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{post.user_profiles.department}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
} 