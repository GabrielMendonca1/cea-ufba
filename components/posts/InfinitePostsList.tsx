"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, BookOpen, Hash } from "lucide-react"

interface Post {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  professor_id: string
  user_profiles: any
  posts: any
}

interface InfinitePostsListProps {
  initialPosts: Post[]
}

export function InfinitePostsList({ initialPosts }: InfinitePostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts?page=${page + 1}&limit=10`)
      const data = await response.json()

      if (data.success && data.posts.length > 0) {
        setPosts(prev => [...prev, ...data.posts])
        setPage(prev => prev + 1)
        
        // If we got less than 10 posts, we've reached the end
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
  }, [page, isLoading, hasMore])

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

  const getRandomTags = () => {
    const allTags = [
      "pesquisa científica",
      "inovação tecnológica", 
      "desenvolvimento acadêmico",
      "metodologia científica",
      "análise de dados",
      "publicação científica",
      "colaboração internacional",
      "sustentabilidade",
      "inteligência artificial",
      "biotecnologia"
    ]
    
    // Return 2-3 random tags
    const shuffled = allTags.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.floor(Math.random() * 2) + 2)
  }

  return (
    <div className="space-y-8">
      {posts.map((post, index) => {
        const author = (post.user_profiles as any)?.[0]
        const category = getCategoryFromDepartment(author?.department)
        const tags = getRandomTags()
        
        return (
          <Card key={post.id} className="border-0 transition-all duration-300 bg-white">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Category */}
                <div className="text-sm font-medium text-blue-600 tracking-wide">
                  {category}
                </div>

                {/* Main Title */}
                <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                  {post.title}
                </h2>

                {/* Description */}
                <p className="text-lg text-gray-600 leading-relaxed">
                  {post.description}
                </p>

                {/* Content Preview */}
                {(post.posts as any)?.[0]?.content_markdown && (
                  <div className="text-base text-gray-700 leading-relaxed border-l-2 border-gray-200 pl-4">
                    {(post.posts as any)?.[0]?.content_markdown?.substring(0, 300)}
                    {(post.posts as any)?.[0]?.content_markdown && (post.posts as any)[0].content_markdown.length > 300 && '...'}
                  </div>
                )}

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
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Carregando mais posts...
          </div>
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