import { Card, CardContent } from "@/components/ui/card";
import { User, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { InfinitePostsList } from "@/components/posts/InfinitePostsList";

export default async function Welcome() {
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

        <InfinitePostsList />
      </section>
    </main>
  );
}

