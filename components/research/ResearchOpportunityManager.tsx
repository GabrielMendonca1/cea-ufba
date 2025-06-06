"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResearchOpportunity,
} from "@/lib/queries";
import { Plus, FileText, Calendar, Users, DollarSign, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ResearchApplicationsModal } from "./research-applications-modal";
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
} from "@/components/ui/alert-dialog";

interface ResearchOpportunityManagerProps {
  researchOpportunities: ResearchOpportunity[] | null;
}

export function ResearchOpportunityManager({ researchOpportunities }: ResearchOpportunityManagerProps) {
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<ResearchOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleViewApplications = (opportunity: ResearchOpportunity) => {
    setSelectedResearch(opportunity);
    setIsApplicationsModalOpen(true);
  };

  const handleDelete = async (opportunityId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/research/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId }),
      });

      if (response.ok) {
        router.refresh(); // Refresh the page to show updated data
      } else {
        const errorData = await response.json();
        console.error("Failed to delete research opportunity:", errorData);
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting research opportunity:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Suas Oportunidades de Pesquisa</h3>
        <Link href="/dashboard/research/create" passHref>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Criar Nova Oportunidade
          </Button>
        </Link>
      </div>

      {/* Research Opportunities List */}
      <div className="grid gap-4">
        {researchOpportunities && researchOpportunities.length > 0 ? (
          researchOpportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                    <CardDescription>{opportunity.research_area}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplications(opportunity)}
                      className="gap-2"
                      disabled={isLoading}
                    >
                      <FileText className="w-4 h-4" />
                      Ver Inscrições
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente a sua oportunidade de pesquisa.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(opportunity.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{opportunity.description.substring(0, 200)}...</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Vacancies: {opportunity.vacancies}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>Value: {opportunity.monthly_value}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma oportunidade de pesquisa criada ainda.</p>
              <Link href="/dashboard/research/create" passHref>
                <Button className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Crie sua primeira oportunidade
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Applications Modal */}
      {selectedResearch && (
        <ResearchApplicationsModal
          isOpen={isApplicationsModalOpen}
          onClose={() => setIsApplicationsModalOpen(false)}
          researchOpportunity={selectedResearch}
        />
      )}
    </div>
  );
} 