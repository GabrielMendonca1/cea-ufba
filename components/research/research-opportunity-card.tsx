import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Clock, Users, GraduationCap, DollarSign, Award } from "lucide-react";
import { ResearchOpportunity } from "@/hooks/use-infinite-scroll";

interface ResearchOpportunityCardProps {
  opportunity: ResearchOpportunity;
  index: number;
  onCardClick: (opportunity: ResearchOpportunity) => void;
  onApplyClick: (e: React.MouseEvent, opportunity: ResearchOpportunity) => void;
}

export function ResearchOpportunityCard({ 
  opportunity, 
  index, 
  onCardClick, 
  onApplyClick 
}: ResearchOpportunityCardProps) {
  
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
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-blue-600"
      onClick={() => onCardClick(opportunity)}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/3">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={getScholarshipBadgeVariant(opportunity.scholarship_type)} className="font-medium">
                {opportunity.scholarship_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {opportunity.research_area}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Deadline: {formatDate(opportunity.deadline)}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                #{index + 1}
              </span>
            </div>
            <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
              {opportunity.title}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-base">
              {opportunity.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback><GraduationCap className="w-5 h-5" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Prof. Dr. [Nome do Professor]</p>
                <p className="text-xs text-muted-foreground">{opportunity.department}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{opportunity.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-green-600">{formatCurrency(opportunity.monthly_value)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{opportunity.vacancies} vaga{opportunity.vacancies > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <span>Início: {formatDate(opportunity.start_date)}</span>
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
            {opportunity.workload}
          </p>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={(e) => onApplyClick(e, opportunity)}
          >
            Candidatar-se
          </Button>
        </div>
      </div>
    </Card>
  );
} 