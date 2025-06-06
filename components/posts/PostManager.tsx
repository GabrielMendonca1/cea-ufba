"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Calendar, User, BookOpen, Edit, Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Post {
  id: string
  title: string
  description: string
  created_at: string
  user_profiles: {
    full_name: string | null
    email: string
  } | null
  posts: {
    content: unknown // JSONB from BlockNote
  } | null
}

interface PostManagerProps {
  userId: string
}

export function PostManager({ userId }: PostManagerProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/posts') // This should probably be user-specific
        const data = await response.json()
        
        if (data.success) {
          // Assuming the API returns all posts, filter for the current user
          const userPosts = data.posts.filter((post: Post & { professor_id: string }) => post.professor_id === userId)
          setPosts(userPosts)
        } else {
          console.error('Failed to fetch posts:', data.error)
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [userId])

  const handleDelete = async (postId: string) => {
    setIsDeleting(postId);
    try {
      const response = await fetch('/api/posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('An unexpected error occurred while deleting the post.');
    } finally {
      setIsDeleting(null);
    }
  };

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
        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/posts/create">
            <PlusCircle className="w-4 h-4" />
            Criar Post
          </Link>
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
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/posts/create">
                <PlusCircle className="w-4 h-4" />
                Criar Primeiro Post
              </Link>
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
                  <div className="flex items-center gap-2">
                     <Badge variant="secondary" className="ml-2">
                      Científico
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/posts/edit/${post.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isDeleting === post.id}>
                          {isDeleting === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(post.id)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 line-clamp-3">
                    Preview do conteúdo não disponível.
                  </div>
                  
                  {/* Author and date info */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.user_profiles?.full_name || post.user_profiles?.email}</span>
                      </div>
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
    </div>
  )
} 