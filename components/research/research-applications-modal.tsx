"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Application } from "@/lib/queries";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Mail, 
  User, 
  Calendar,
  FileText,
  GraduationCap,
  Eye,
  MoreHorizontal
} from "lucide-react";
// Table components inline to avoid dependency issues
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResearchApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchTitle: string;
  researchId: string;
}

interface ApplicationWithProfile {
  id: string;
  student_id: string;
  research_opportunity_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | null;
  cover_letter: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    full_name: string | null;
    email: string;
    student_id: string | null;
    course: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

export function ResearchApplicationsModal({ 
  isOpen, 
  onClose, 
  researchTitle, 
  researchId 
}: ResearchApplicationsModalProps) {
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch applications when modal opens
  useEffect(() => {
    if (isOpen && researchId) {
      fetchApplications();
    }
  }, [isOpen, researchId]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/research/applications?researchId=${researchId}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Erro ao buscar inscrições:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/applications/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const acceptedApplications = applications.filter(app => app.status === 'accepted');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Aceito</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = (application: ApplicationWithProfile) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const ApplicationsTable = ({ applications, showActions = false }: { 
    applications: ApplicationWithProfile[], 
    showActions?: boolean 
  }) => (
    <div className="rounded-lg border overflow-hidden bg-card">
      {/* Header */}
      <div className="grid grid-cols-8 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
        <div className="col-span-1">Avatar</div>
        <div className="col-span-2">Candidato</div>
        <div className="col-span-1">Email</div>
        <div className="col-span-1">Matrícula</div>
        <div className="col-span-1">Curso</div>
        <div className="col-span-1">Data</div>
        <div className="col-span-1">Ações</div>
      </div>
      
      {/* Rows */}
      <div className="divide-y">
        {applications.map((application) => (
          <div key={application.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-muted/30 transition-colors">
            <div className="col-span-1 flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={application.user_profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {application.user_profiles?.full_name?.charAt(0) || 
                   application.user_profiles?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="col-span-2 flex flex-col justify-center">
              <div className="font-semibold text-sm">
                {application.user_profiles?.full_name || 'Nome não informado'}
              </div>
              {application.user_profiles?.bio && (
                <div className="text-xs text-muted-foreground truncate">
                  {application.user_profiles.bio}
                </div>
              )}
              <div className="mt-1">
                {getStatusBadge(application.status || 'pending')}
              </div>
            </div>
            
            <div className="col-span-1 flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs truncate">{application.user_profiles?.email}</span>
              </div>
            </div>
            
            <div className="col-span-1 flex items-center">
              {application.user_profiles?.student_id ? (
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-mono">{application.user_profiles.student_id}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">-</span>
              )}
            </div>
            
            <div className="col-span-1 flex items-center">
              {application.user_profiles?.course ? (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs truncate">{application.user_profiles.course}</span>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">-</span>
              )}
            </div>
            
            <div className="col-span-1 flex items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">
                  {new Date(application.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
            
            <div className="col-span-1 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewDetails(application)}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              {showActions && application.status === 'pending' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(application.id, 'accepted')}
                      className="text-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aceitar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      className="text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApplicationDetailModal = () => (
    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedApplication?.user_profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                {selectedApplication?.user_profiles?.full_name?.charAt(0) || 
                 selectedApplication?.user_profiles?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>{selectedApplication?.user_profiles?.full_name || selectedApplication?.user_profiles?.email}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Detalhes da candidatura
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {selectedApplication && (
          <div className="space-y-6 mt-6">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedApplication.user_profiles?.email}</span>
                </div>
              </div>
              
              {selectedApplication.user_profiles?.student_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Matrícula</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono">{selectedApplication.user_profiles.student_id}</span>
                  </div>
                </div>
              )}
              
              {selectedApplication.user_profiles?.course && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Curso</label>
                  <div className="flex items-center gap-2 mt-1">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedApplication.user_profiles.course}</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data da Inscrição</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(selectedApplication.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {selectedApplication.user_profiles?.bio && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sobre o Candidato</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedApplication.user_profiles.bio}</p>
                </div>
              </div>
            )}

            {/* Carta de apresentação */}
            {selectedApplication.cover_letter && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Carta de Apresentação</label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Ações */}
            {selectedApplication.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, 'accepted');
                    setIsDetailModalOpen(false);
                  }}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aceitar Candidato
                </Button>
                <Button
                  onClick={() => {
                    handleStatusUpdate(selectedApplication.id, 'rejected');
                    setIsDetailModalOpen(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar Candidato
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden backdrop-blur-sm bg-background/95 shadow-2xl border-2">
          <DialogHeader className="pb-6 border-b">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              📋 Inscrições - {researchTitle}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="inscricoes" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="inscricoes" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Clock className="w-4 h-4" />
                📝 Inscrições ({pendingApplications.length})
              </TabsTrigger>
              <TabsTrigger value="deferidos" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
                <CheckCircle className="w-4 h-4" />
                ✅ Deferidos ({acceptedApplications.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="inscricoes" className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                      <p className="text-muted-foreground">Carregando inscrições...</p>
                    </div>
                  </div>
                ) : pendingApplications.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                          <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                            {pendingApplications.length} candidatura(s) aguardando avaliação
                          </h3>
                          <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            Revise os candidatos e tome uma decisão
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ApplicationsTable applications={pendingApplications} showActions={true} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="p-8 bg-muted/50 rounded-xl inline-block backdrop-blur-sm">
                      <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma inscrição pendente</h3>
                      <p className="text-muted-foreground">
                        Todas as candidaturas foram avaliadas ou ainda não há inscrições
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="deferidos" className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
                      <p className="text-muted-foreground">Carregando candidatos aceitos...</p>
                    </div>
                  </div>
                ) : acceptedApplications.length > 0 ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-green-800 dark:text-green-200">
                            {acceptedApplications.length} candidato(s) aprovado(s)
                          </h3>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Candidatos selecionados para a pesquisa
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <ApplicationsTable applications={acceptedApplications} showActions={false} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="p-8 bg-muted/50 rounded-xl inline-block backdrop-blur-sm">
                      <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum candidato aceito</h3>
                      <p className="text-muted-foreground">
                        Ainda não há candidatos aprovados para esta pesquisa
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ApplicationDetailModal />
    </>
  );
} 