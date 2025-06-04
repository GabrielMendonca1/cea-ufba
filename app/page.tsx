import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { InfinitePostsList } from "@/components/posts/InfinitePostsList";

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

export default async function Welcome() {
  const supabase = await createClient()

  // Fetch initial posts for server-side rendering (first page)
  const { data: initialPosts } = await supabase
    .from('scientific_outreach')
    .select(`
      id,
      title,
      description,
      created_at,
      updated_at,
      professor_id,
      user_profiles:professor_id (
        full_name,
        email,
        department,
        research_area
      ),
      posts:post_id (
        id,
        content_markdown,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  const posts = initialPosts || []

  return (
    <main className="flex-1 flex flex-col gap-8 px-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight">CEA UFBA</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Centro de Excelência Acadêmica - Conectando conhecimento científico e oportunidades de pesquisa
        </p>
      </div>

      {/* Explorer Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-center">Explore</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/pesquisas">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Oportunidades de Pesquisa</h3>
                  <p className="text-sm text-muted-foreground">Descubra projetos de pesquisa disponíveis</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard">
            <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Dashboard</h3>
                  <p className="text-sm text-muted-foreground">Acesse seu painel pessoal</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/docentes">
            <Card className="cursor-pointer group">
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Docentes</h3>
                  <p className="text-sm text-muted-foreground">Conheça os professores e pesquisadores</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Posts Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">Posts Científicos</h2>
          <p className="text-muted-foreground">Últimas publicações da comunidade acadêmica</p>
        </div>

        {posts.length > 0 ? (
          <InfinitePostsList initialPosts={posts} />
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nenhum post ainda</h3>
              <p className="text-muted-foreground">Os professores ainda não publicaram conteúdo científico.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

