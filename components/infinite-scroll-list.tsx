"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { CalendarDays, Clock, Users, GraduationCap, MapPin, BookOpen, Award, DollarSign, ChevronDown } from "lucide-react";

interface ResearchOpportunity {
  id: number;
  title: string;
  description: string;
  supervisor: string;
  supervisorAvatar: string;
  department: string;
  faculty: string;
  researchArea: string;
  scholarshipType: string;
  duration: string;
  monthlyValue: string;
  requirements: string[];
  startDate: string;
  deadline: string;
  vacancies: number;
  workload: string;
  objectives: string[];
  methodology: string;
  expectedResults: string[];
  contactEmail: string;
  lattes: string;
}

const departments = [
  "Instituto de Física", "Instituto de Química", "Instituto de Matemática", 
  "Faculdade de Medicina", "Escola Politécnica", "Instituto de Ciências da Saúde",
  "Faculdade de Filosofia e Ciências Humanas", "Instituto de Biologia",
  "Faculdade de Comunicação", "Instituto de Geociências"
];

const researchAreas = [
  "Inteligência Artificial", "Biotecnologia", "Medicina Tropical", "Engenharia de Software",
  "Neurociências", "Oceanografia", "História Social", "Física Quântica",
  "Ecologia Marinha", "Comunicação Digital", "Matemática Aplicada", "Química Orgânica"
];

const scholarshipTypes = ["PIBIC", "PIBITI", "PIBIC-EM", "PIBIT", "Iniciação Científica Voluntária"];

const mockData: ResearchOpportunity[] = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  title: `${researchAreas[i % researchAreas.length]}: ${i % 4 === 0 ? 'Desenvolvimento de Algoritmos' : i % 3 === 0 ? 'Análise Comportamental' : i % 2 === 0 ? 'Estudos Clínicos' : 'Inovação Tecnológica'} em ${researchAreas[i % researchAreas.length]}`,
  description: `Projeto de pesquisa focado em ${researchAreas[i % researchAreas.length].toLowerCase()} com aplicações práticas na sociedade. Oportunidade para estudantes desenvolverem habilidades de pesquisa científica e contribuírem para o avanço do conhecimento na área.`,
  supervisor: `Prof. Dr. ${['Ana Beatriz Silva', 'Carlos Eduardo Santos', 'Maria Fernanda Oliveira', 'João Paulo Costa', 'Fernanda Lima Rocha', 'Roberto Almeida', 'Juliana Cardoso', 'Pedro Henrique Souza'][i % 8]}`,
  supervisorAvatar: `https://i.pravatar.cc/150?img=${(i % 20) + 1}`,
  department: departments[i % departments.length],
  faculty: departments[i % departments.length].includes('Instituto') ? 'Instituto' : 'Faculdade',
  researchArea: researchAreas[i % researchAreas.length],
  scholarshipType: scholarshipTypes[i % scholarshipTypes.length],
  duration: `${Math.floor(Math.random() * 8) + 12} meses`,
  monthlyValue: scholarshipTypes[i % scholarshipTypes.length] !== 'Iniciação Científica Voluntária' ? `R$ ${(Math.random() * 200 + 400).toFixed(0)}` : 'Voluntário',
  requirements: [
    'Estar regularmente matriculado na UFBA',
    'Ter coeficiente de rendimento mínimo de 7.0',
    'Disponibilidade de 20h semanais',
    'Conhecimentos básicos na área de pesquisa'
  ],
  startDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  vacancies: Math.floor(Math.random() * 3) + 1,
  workload: '20 horas semanais',
  objectives: [
    'Desenvolver competências em metodologia científica',
    'Contribuir para a produção de conhecimento científico',
    'Preparar o estudante para pós-graduação',
    'Fomentar a inovação e criatividade'
  ],
  methodology: 'A pesquisa será desenvolvida através de revisão bibliográfica, coleta e análise de dados, experimentos controlados e discussão dos resultados com a equipe de pesquisa.',
  expectedResults: [
    'Publicação de artigo científico',
    'Apresentação em congressos',
    'Relatório técnico detalhado',
    'Formação científica do bolsista'
  ],
  contactEmail: `pesquisa${i + 1}@ufba.br`,
  lattes: `http://lattes.cnpq.br/professor${i + 1}`
}));

const ITEMS_PER_PAGE = 10;

export default function ResearchOpportunitiesList() {
  const [items, setItems] = useState<ResearchOpportunity[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedResearch, setSelectedResearch] = useState<ResearchOpportunity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Função para carregar mais itens
  const loadMoreItems = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newItems = mockData.slice(startIndex, endIndex);
    
    if (newItems.length === 0) {
      setHasMore(false);
    } else {
      setItems(prevItems => [...prevItems, ...newItems]);
      setCurrentPage(prev => prev + 1);
      setHasMore(endIndex < mockData.length);
    }
    
    setLoading(false);
  }, [currentPage, loading, hasMore]);

  // Carregar itens iniciais
  useEffect(() => {
    if (items.length === 0) {
      loadMoreItems();
    }
  }, [loadMoreItems, items.length]);

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

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Header com contador */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Oportunidades de Pesquisa UFBA
        </h1>
        <p className="text-muted-foreground">
          Mostrando {items.length} de {mockData.length} oportunidades disponíveis
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
                    <Badge variant={getScholarshipBadgeVariant(item.scholarshipType)} className="font-medium">
                      {item.scholarshipType}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.researchArea}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Deadline: {item.deadline}
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
                      <AvatarImage src={item.supervisorAvatar} alt={item.supervisor} />
                      <AvatarFallback><GraduationCap className="w-5 h-5" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{item.supervisor}</p>
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
                      <span className="font-medium text-green-600">{item.monthlyValue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{item.vacancies} vaga{item.vacancies > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      <span>Início: {item.startDate}</span>
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
              <span>Você visualizou todas as {mockData.length} oportunidades disponíveis!</span>
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
                    <Badge variant={getScholarshipBadgeVariant(selectedResearch.scholarshipType)}>
                      {selectedResearch.scholarshipType}
                    </Badge>
                    <Badge variant="outline">{selectedResearch.researchArea}</Badge>
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
                      <AvatarImage src={selectedResearch.supervisorAvatar} alt={selectedResearch.supervisor} />
                      <AvatarFallback><GraduationCap className="w-6 h-6" /></AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-lg">{selectedResearch.supervisor}</h4>
                      <p className="text-sm text-muted-foreground">Orientador(a)</p>
                      <p className="text-sm font-medium text-blue-600">{selectedResearch.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="text-blue-600">{selectedResearch.contactEmail}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lattes:</span>
                      <p className="text-blue-600 truncate">{selectedResearch.lattes}</p>
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
                        <p className="font-medium">{selectedResearch.startDate}</p>
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
                        <p className="font-medium text-green-600 text-lg">{selectedResearch.monthlyValue}</p>
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
                        ⏰ Deadline: {selectedResearch.deadline}
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
                    {selectedResearch.objectives.map((objective, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Methodology */}
                <div>
                  <h4 className="font-semibold mb-3">Metodologia</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedResearch.methodology}
                  </p>
                </div>

                <Separator />

                {/* Requirements */}
                <div>
                  <h4 className="font-semibold mb-3">Requisitos</h4>
                  <ul className="space-y-2">
                    {selectedResearch.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Expected Results */}
                <div>
                  <h4 className="font-semibold mb-3">Resultados Esperados</h4>
                  <ul className="space-y-2">
                    {selectedResearch.expectedResults.map((result, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        {result}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Application Button */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-lg font-bold text-green-600">{selectedResearch.monthlyValue}</p>
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