
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
import { useRealtimeTable } from '@/hooks/useRealtimeTable'
import { professorLoading } from '@/components/ui/professor-loading'
import useAuthUser from '@/hooks/use-auth-user'

interface ScientificOutreachPost {
  id: string
  title: string
  description: string
  created_at: string
  user_profiles: {
    full_name: string | null
    email: string
  } | null
  professor_id: string
}

export default function ScientificOutreachManagerPage() {
  const { user, isLoading: isUserLoading } = useAuthUser()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Use useRealtimeTable to get real-time updates for scientific_outreach
  const [allOutreachPosts] = useRealtimeTable<ScientificOutreachPost>('scientific_outreach', [])

  // Filter posts by the current user's ID
  const userOutreachPosts = allOutreachPosts.filter(post => post.professor_id === user?.id)

  const handleDelete = async (postId: string) => {
    setIsDeleting(postId)
    try {
      const response = await fetch(`/api/outreach/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // The useRealtimeTable hook will automatically update the state
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting scientific outreach post:', error)
      alert('An unexpected error occurred while deleting the post.')
    } finally {
      setIsDeleting(null)
    }
  }

  if (isUserLoading) {
    return professorLoading()
  }

  if (!user || user.user_type !== 'professor') {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Acesso negado. Apenas professores podem gerenciar divulgações científicas.
      </div>
    )
  }

  if (userOutreachPosts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Minhas Divulgações Científicas</h3>
          <Button asChild className="flex items-center gap-2">
            <Link href="/dashboard/posts/create">
              <PlusCircle className="w-4 h-4" />
              Criar Nova Divulgação
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma divulgação científica encontrada
            </h3>
            <p className="text-gray-500 mb-4">
              Comece compartilhando suas pesquisas e descobertas com a comunidade acadêmica.
            </p>
            <Button asChild className="flex items-center gap-2">
              <Link href="/dashboard/posts/create">
                <PlusCircle className="w-4 h-4" />
                Criar Primeira Divulgação
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Minhas Divulgações Científicas</h3>
        <Button asChild className="flex items-center gap-2">
          <Link href="/dashboard/posts/create">
            <PlusCircle className="w-4 h-4" />
            Criar Nova Divulgação
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {userOutreachPosts.map((post) => (
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
                    Divulgação Científica
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
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita. Isso excluirá permanentemente sua divulgação científica.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)}>
                          Continuar
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
    </div>
  )
}
