"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CalendarDays, Clock, Users, GraduationCap, MapPin, BookOpen, Award, DollarSign, ChevronDown, User, Calendar } from "lucide-react";

type ResearchOpportunity = {
  id: string;
  title: string;
  description: string;
  research_area: string;
  department: string;
  faculty: string;
  monthly_value: string;
  deadline: string;
  start_date: string;
  duration: string;
  vacancies: number;
  workload: string;
  scholarship_type: string;
  is_active: boolean | null;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function ResearchOpportunitiesList() {
  const [items, setItems] = useState<ResearchOpportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ResearchOpportunity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Função para carregar mais itens
  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    try {
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from("research_opportunities")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(startIndex, endIndex);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setHasMore(false);
      } else {
        // Filter out duplicates by checking existing IDs
        setItems(prevItems => {
          const existingIds = new Set(prevItems.map(item => item.id));
          const newItems = data.filter(item => !existingIds.has(item.id));
          return [...prevItems, ...newItems];
        });
        setCurrentPage(prev => prev + 1);
        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar oportunidades");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [currentPage, loading, hasMore, supabase]);

  // Carregar itens iniciais
  useEffect(() => {
    if (items.length === 0 && !loading && !error) {
      loadMoreItems();
    }
  }, [items.length, loading, error]);

  // Intersection Observer para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [loadMoreItems, hasMore, loading]);

  const handleResearchClick = (research: ResearchOpportunity) => {
    setSelectedResearch(research);
    setIsSheetOpen(true);
  };

  const getScholarshipBadgeVariant = (type: string) => {
    if (type === 'PIBIC') return 'default';
    if (type === 'PIBITI') return 'secondary';
    if (type === 'Iniciação Científica Voluntária') return 'outline';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(numValue);
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-96"></div>
          <div className="h-4 bg-gray-200 rounded mx-auto w-64"></div>
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="overflow-hidden border-l-4 border-l-blue-600">
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
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Erro ao carregar oportunidades</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => {
            setError(null);
            setCurrentPage(0);
            setItems([]);
            setHasMore(true);
            setInitialLoading(true);
          }}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header com contador */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Oportunidades de Pesquisa UFBA
        </h1>
        <p className="text-muted-foreground">
          Mostrando {items.length} oportunidades disponíveis
        </p>
      </div>

      <div className="space-y-8">
        {items.map((item, index) => (
          <Card 
            key={item.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-600"
            onClick={() => handleResearchClick(item)}
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant={getScholarshipBadgeVariant(item.scholarship_type)} className="font-medium">
                      {item.scholarship_type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.research_area}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Deadline: {formatDate(item.deadline)}
                    </span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback><GraduationCap className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Prof. Dr. [Nome do Professor]</p>
                      <p className="text-xs text-muted-foreground">{item.department}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{item.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-green-600">{formatCurrency(item.monthly_value)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{item.vacancies} vaga{item.vacancies > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span>Início: {formatDate(item.start_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </div>
              
              <div className="md:w-1/3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 flex flex-col justify-center items-center text-center">
                <Award className="w-12 h-12 text-blue-600 mb-3" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Oportunidade de Pesquisa
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-200 mb-4">
                  {item.workload}
                </p>
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle application
                  }}
                >
                  Candidatar-se
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Loading e Load More */}
      <div ref={loadingRef} className="mt-8">
        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-muted-foreground">Carregando mais oportunidades...</p>
            </div>
          </div>
        )}
        
        {!loading && hasMore && items.length > 0 && (
          <div className="text-center py-8">
            <Button 
              onClick={loadMoreItems}
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
        )}
        
        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Award className="w-5 h-5" />
              <span>Você visualizou todas as oportunidades disponíveis!</span>
            </div>
          </div>
        )}
        
        {items.length === 0 && !loading && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Nenhuma oportunidade de pesquisa disponível no momento.
            </p>
          </div>
        )}
      </div>

      {/* Research Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          {selectedResearch && (
            <>
              <SheetHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getScholarshipBadgeVariant(selectedResearch.scholarship_type)}>
                      {selectedResearch.scholarship_type}
                    </Badge>
                    <Badge variant="outline">{selectedResearch.research_area}</Badge>
                  </div>
                </div>
                <SheetTitle className="text-2xl leading-tight">
                  {selectedResearch.title}
                </SheetTitle>
                <SheetDescription className="text-base">
                  {selectedResearch.description}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Supervisor Info */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback><GraduationCap className="w-6 h-6" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">Prof. Dr. [Nome do Professor]</h4>
                      <p className="text-sm text-muted-foreground">Orientador(a)</p>
                      <p className="text-sm font-medium text-blue-600">{selectedResearch.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="text-blue-600">pesquisa@ufba.br</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lattes:</span>
                      <p className="text-blue-600 truncate">http://lattes.cnpq.br/professor</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Research Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data de Início</p>
                        <p className="font-medium">{formatDate(selectedResearch.start_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Duração</p>
                        <p className="font-medium">{selectedResearch.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
                        <p className="font-medium">{selectedResearch.vacancies} vaga{selectedResearch.vacancies > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Valor da Bolsa</p>
                        <p className="font-medium text-green-600 text-lg">{formatCurrency(selectedResearch.monthly_value)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Carga Horária</p>
                        <p className="font-medium">{selectedResearch.workload}</p>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        ⏰ Deadline: {formatDate(selectedResearch.deadline)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Objectives */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Objetivos da Pesquisa
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Desenvolver competências em metodologia científica
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Contribuir para a produção de conhecimento científico
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Preparar o estudante para pós-graduação
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Fomentar a inovação e criatividade
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Methodology */}
                <div>
                  <h4 className="font-semibold mb-3">Metodologia</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A pesquisa será desenvolvida através de revisão bibliográfica, coleta e análise de dados, experimentos controlados e discussão dos resultados com a equipe de pesquisa.
                  </p>
                </div>

                <Separator />

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold mb-3">Requisitos</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Estar regularmente matriculado na UFBA
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Ter coeficiente de rendimento mínimo de 7.0
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Disponibilidade de 20h semanais
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Conhecimentos básicos na área de pesquisa
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Expected Results */}
                <div>
                  <h4 className="font-semibold mb-3">Resultados Esperados</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Publicação de artigo científico
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Apresentação em congressos
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Relatório técnico detalhado
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Formação científica do bolsista
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Application Button */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(selectedResearch.monthly_value)}</p>
                    <p className="text-sm text-muted-foreground">Bolsa mensal</p>
                  </div>
                  <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700">
                    Candidatar-se à Pesquisa
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
} 