import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CalendarDays, Clock, Users, GraduationCap, DollarSign, BookOpen, Award } from "lucide-react";
import { ResearchOpportunity } from "@/hooks/use-infinite-scroll";

interface ResearchDetailsSheetProps {
  research: ResearchOpportunity;
  onApply: () => void;
}

export function ResearchDetailsSheet({ research, onApply }: ResearchDetailsSheetProps) {
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
    const numValue = parseFloat(value.replace(/[^\d,]/g, '').replace(',', '.'));
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(numValue);
  };

  return (
    <>
      <SheetHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-blue-600" />
          <div className="flex flex-wrap gap-2">
            <Badge variant={getScholarshipBadgeVariant(research.scholarship_type)}>
              {research.scholarship_type}
            </Badge>
            <Badge variant="outline">{research.research_area}</Badge>
          </div>
        </div>
        <SheetTitle className="text-2xl leading-tight">
          {research.title}
        </SheetTitle>
        <SheetDescription className="text-base">
          {research.description}
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
              <p className="text-sm font-medium text-blue-600">{research.department}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="text-blue-600">{research.contact_email}</p>
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
                <p className="font-medium">{formatDate(research.start_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{research.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
                <p className="font-medium">{research.vacancies} vaga{research.vacancies > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Valor da Bolsa</p>
                <p className="font-medium text-green-600 text-lg">{formatCurrency(research.monthly_value)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Carga Horária</p>
                <p className="font-medium">{research.workload}</p>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⏰ Deadline: {formatDate(research.deadline)}
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
            {research.objectives?.length > 0 ? (
              research.objectives.map((objective, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  {objective}
                </li>
              ))
            ) : (
              <li className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Desenvolver competências em metodologia científica
              </li>
            )}
          </ul>
        </div>

        <Separator />

        {/* Methodology */}
        <div>
          <h4 className="font-semibold mb-3">Metodologia</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {research.methodology || "A pesquisa será desenvolvida através de revisão bibliográfica, coleta e análise de dados, experimentos controlados e discussão dos resultados com a equipe de pesquisa."}
          </p>
        </div>

        <Separator />

        {/* Requirements */}
        <div>
          <h4 className="font-semibold mb-3">Requisitos</h4>
          <ul className="space-y-2">
            {research.requirements?.length > 0 ? (
              research.requirements.map((requirement, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  {requirement}
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Estar regularmente matriculado na UFBA
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Ter coeficiente de rendimento mínimo de 7.0
                </li>
              </>
            )}
          </ul>
        </div>

        <Separator />

        {/* Expected Results */}
        <div>
          <h4 className="font-semibold mb-3">Resultados Esperados</h4>
          <ul className="space-y-2">
            {research.expected_results?.length > 0 ? (
              research.expected_results.map((result, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  {result}
                </li>
              ))
            ) : (
              <>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Publicação de artigo científico
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Apresentação em congressos
                </li>
              </>
            )}
          </ul>
        </div>

        <Separator />

        {/* Application Button */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(research.monthly_value)}</p>
            <p className="text-sm text-muted-foreground">Bolsa mensal</p>
          </div>
          <Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700" onClick={onApply}>
            Candidatar-se à Pesquisa
          </Button>
        </div>
      </div>
    </>
  );
} 