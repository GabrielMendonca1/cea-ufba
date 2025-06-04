import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-4">
            404
          </CardTitle>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
          <CardDescription>
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Página Inicial
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pesquisas" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Pesquisas
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 