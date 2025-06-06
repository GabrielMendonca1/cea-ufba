import { createServiceRoleClient } from '@/utils/supabase/service'
import BlockNoteViewer from '@/components/posts/BlockNoteViewer'
import { notFound } from 'next/navigation'
import { Calendar, User, BookOpen } from 'lucide-react'

async function getPost(id: string) {
  const supabase = createServiceRoleClient()
  const { data: post, error } = await supabase
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

  if (error || !post) {
    notFound()
  }

  return {
    ...post,
    user_profiles: Array.isArray(post.user_profiles) ? post.user_profiles[0] : post.user_profiles,
    posts: Array.isArray(post.posts) ? post.posts[0] : post.posts,
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
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