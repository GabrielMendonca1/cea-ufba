"use client"

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, BookOpen, ArrowRight } from "lucide-react"
import { Button } from '../ui/button'

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
  } | null
  posts: {
    content: string
  } | null
}

import { useRealtimeTable } from '@/hooks/useRealtimeTable'

export function InfinitePostsList() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  // Use useRealtimeTable for real-time updates and initial data
  const [posts, setPosts] = useRealtimeTable<Post>('scientific_outreach', [])

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts?page=${page + 1}&limit=10`)
      const data = await response.json()

      if (data.success && data.posts.length > 0) {
        setPosts(prev => {
          const newPosts = data.posts.filter((newPost: Post) => 
            !prev.some(existingPost => existingPost.id === newPost.id)
          );
          // Sort posts by created_at in descending order to ensure new posts appear at the top
          return [...prev, ...newPosts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
        setPage(prev => prev + 1)
        
        if (data.posts.length < 10) {
          setHasMore(false)
        }
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
      setHasMore(false)
    } finally {
      setIsLoading(false)
    }
  }, [page, isLoading, hasMore, setPosts]) // Add setPosts to dependencies

  useEffect(() => {
    // Initial load of posts
    if (posts.length === 0 && !isLoading) { // Only load if no posts are present and not already loading
      loadMorePosts()
    }
  }, [loadMorePosts, posts.length, isLoading])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= 
          document.documentElement.offsetHeight - 1000) {
        loadMorePosts()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadMorePosts])

  const getCategoryFromDepartment = (department: string | null) => {
    if (!department) return "Pesquisa Científica"
    
    // Map departments to categories
    const categoryMap: { [key: string]: string } = {
      "Administração": "Administração Pública. Governo. Estado",
      "Ciência da Computação": "Tecnologia. Inovação. Ciência",
      "Medicina": "Saúde. Medicina. Ciências Biológicas", 
      "Engenharia": "Engenharia. Tecnologia. Inovação",
      "Direito": "Direito. Jurisprudência. Estado",
      "Economia": "Economia. Finanças. Mercado"
    }
    
    return categoryMap[department] || `${department}. Pesquisa. Ciência`
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => {
        const author = post.user_profiles;
        const category = getCategoryFromDepartment(author?.department || null);
        
        return (
          <Card key={post.id} className="border-0 transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Category */}
                <div className="text-sm font-medium text-blue-600 tracking-wide">
                  {category}
                </div>

                {/* Main Title */}
                <Link href={`/posts/${post.id}`} className="block">
                  <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                </Link>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed">
                  {post.description}
                </p>

                {/* Content Preview */}
                <div className="text-base text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-4 italic">
                  Clique em &quot;Ler Mais&quot; para ver o conteúdo completo.
                </div>

                <div className="pt-4">
                  <Button asChild>
                    <Link href={`/posts/${post.id}`}>
                      Ler Mais
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Meta Information */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">
                        {author?.full_name || author?.email}
                      </span>
                    </div>
                    
                    {author?.department && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{author.department}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Carregando mais posts...</p>
        </div>
      )}

      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          Todos os posts foram carregados
        </div>
      )}
    </div>
  )
} 