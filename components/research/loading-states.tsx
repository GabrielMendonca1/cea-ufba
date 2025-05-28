import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ChevronDown } from "lucide-react";

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-600">
      <div className="flex flex-col md:flex-row animate-pulse">
        <div className="md:w-2/3 p-6">
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="md:w-1/3 bg-gray-100 p-6"></div>
      </div>
    </Card>
  );
}

export function InitialLoadingSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-96"></div>
        <div className="h-4 bg-gray-200 rounded mx-auto w-64"></div>
      </div>
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingIndicator() {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="text-muted-foreground">Carregando mais oportunidades...</p>
      </div>
    </div>
  );
}

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  loading: boolean;
}

export function LoadMoreButton({ onLoadMore, loading }: LoadMoreButtonProps) {
  return (
    <div className="text-center py-8">
      <Button 
        onClick={onLoadMore}
        variant="outline" 
        className="gap-2"
        disabled={loading}
      >
        <ChevronDown className="w-4 h-4" />
        Carregar mais 10 oportunidades
      </Button>
      <p className="text-xs text-muted-foreground mt-2">
        Ou role para baixo para carregar automaticamente
      </p>
    </div>
  );
}

export function EndOfListMessage() {
  return (
    <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <Award className="w-5 h-5" />
        <span>Você visualizou todas as oportunidades disponíveis!</span>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground text-lg">
        Nenhuma oportunidade de pesquisa disponível no momento.
      </p>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Erro ao carregar oportunidades</div>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    </div>
  );
} 