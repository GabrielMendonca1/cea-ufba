"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Application, ResearchOpportunity } from "@/lib/queries";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ResearchApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  researchOpportunity: ResearchOpportunity;
}

interface ApplicationWithProfile {
  id: string;
  student_id: string;
  research_opportunity_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | null;
  cover_letter_pdf: string | null;
  cv_vitae_pdf: string | null;
  academic_record_pdf: string | null;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    email: string;
    full_name: string | null;
    user_type: string | null;
    department: string | null;
    research_area: string | null;
    bio: string | null;
    lattes_url: string | null;
    student_id: string | null;
    avatar_url: string | null;
    is_profile_complete: boolean | null;
    has_completed_onboarding: boolean | null;
    created_at: string;
  };
}

export function ResearchApplicationsModal({ 
  isOpen, 
  onClose, 
  researchOpportunity 
}: ResearchApplicationsModalProps) {
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'inscricoes' | 'deferidos'>('inscricoes');

  const researchId = researchOpportunity.id;
  const researchTitle = researchOpportunity.title;

  const fetchApplications = useCallback(async () => {
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
  }, [researchId]);

  // Fetch applications when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchApplications();
    }
  }, [isOpen, fetchApplications]);

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
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Retirado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (application: ApplicationWithProfile) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const ApplicationsTable = ({ applications, showActions = false }: { 
    applications: ApplicationWithProfile[], 
    showActions?: boolean 
  }) => (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[200px]">Candidato</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[200px]">Email</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[120px]">Matrícula</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[180px]">Departamento</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[150px]">Área de Pesquisa</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[100px]">Currículo Lattes</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[120px]">Histórico</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[120px]">Carta</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[100px]">CV</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[100px]">Status</th>
              {showActions && <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[120px]">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr 
                key={application.id} 
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={application.user_profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-muted text-xs">
                        {application.user_profiles?.full_name?.charAt(0) || 
                         application.user_profiles?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {application.user_profiles?.full_name || 'Nome não informado'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(application.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {application.user_profiles?.email}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="text-sm font-mono text-foreground">
                    {application.user_profiles?.student_id || '-'}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {application.user_profiles?.department || '-'}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="text-sm text-foreground">
                    {application.user_profiles?.research_area || '-'}
                  </div>
                </td>
                
                <td className="p-4">
                  {application.user_profiles?.lattes_url ? (
                    <a 
                      href={application.user_profiles.lattes_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      📄 Ver Lattes
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                
                <td className="p-4">
                  {application.academic_record_pdf ? (
                    <a 
                      href={application.academic_record_pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      📄 Ver PDF
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                
                <td className="p-4">
                  {application.cover_letter_pdf ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-3 text-xs"
                      onClick={() => handleViewDetails(application)}
                    >
                      📄 Ver Carta
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                
                <td className="p-4">
                  {application.cv_vitae_pdf ? (
                    <a 
                      href={application.cv_vitae_pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      📄 Ver CV
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                
                <td className="p-4">
                  {getStatusBadge(application.status || 'pending')}
                </td>
                
                {showActions && (
                  <td className="p-4">
                    {application.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          size="sm"
                          className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                          title="Aceitar candidatura"
                        >
                          ✓
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                          title="Rejeitar candidatura"
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ApplicationDetailModal = () => (
    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Informações Pessoais</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedApplication.user_profiles?.email}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedApplication.user_profiles?.full_name || 'Não informado'}</span>
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
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Usuário</label>
                  <div className="flex items-center gap-2 mt-1">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedApplication.user_profiles?.user_type || 'Não informado'}</span>
                  </div>
                </div>
                
                {selectedApplication.user_profiles?.department && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Departamento</label>
                    <div className="flex items-center gap-2 mt-1">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.user_profiles.department}</span>
                    </div>
                  </div>
                )}
                
                {selectedApplication.user_profiles?.research_area && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Área de Pesquisa</label>
                    <div className="flex items-center gap-2 mt-1">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedApplication.user_profiles.research_area}</span>
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

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Perfil Completo</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className={selectedApplication.user_profiles?.is_profile_complete ? 'text-green-600' : 'text-red-600'}>
                      {selectedApplication.user_profiles?.is_profile_complete ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Currículo Lattes */}
            {selectedApplication.user_profiles?.lattes_url && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Currículo Lattes</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={selectedApplication.user_profiles.lattes_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visualizar Currículo Lattes
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Biografia */}
            {selectedApplication.user_profiles?.bio && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Sobre o Candidato</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedApplication.user_profiles.bio}</p>
                </div>
              </div>
            )}

            {/* Documentos */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Documentos Enviados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedApplication.cover_letter_pdf && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={selectedApplication.cover_letter_pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Carta de Apresentação
                      </a>
                    </div>
                  </div>
                )}

                {selectedApplication.cv_vitae_pdf && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={selectedApplication.cv_vitae_pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Curriculum Vitae
                      </a>
                    </div>
                  </div>
                )}

                {selectedApplication.academic_record_pdf && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <a 
                        href={selectedApplication.academic_record_pdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Histórico Acadêmico
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

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

  if (!isOpen) return null;

  return (
    <>
      {/* Custom Modal Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div 
          className="bg-background shadow-2xl rounded-lg overflow-hidden flex flex-col max-w-[90vw] max-h-[85vh] w-full"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '65vw',
            height: '60vh',
            minWidth: '800px',
            minHeight: '500px'
          }}
        >
          {/* Header */}
          <div className="px-6 py-3 bg-background flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Inscrições - {researchTitle}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50 bg-background flex-shrink-0">
            <button
              onClick={() => setActiveTab('inscricoes')}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'inscricoes'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Inscrições ({pendingApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('deferidos')}
              className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'deferidos'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Deferidos ({acceptedApplications.length})
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'inscricoes' && (
              <div className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Carregando inscrições...</p>
                    </div>
                  </div>
                ) : pendingApplications.length > 0 ? (
                  <ApplicationsTable applications={pendingApplications} showActions={true} />
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-base font-medium mb-2">Nenhuma inscrição pendente</h3>
                      <p className="text-sm text-muted-foreground">
                        Todas as candidaturas foram avaliadas ou ainda não há inscrições
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deferidos' && (
              <div className="h-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm text-muted-foreground">Carregando candidatos aceitos...</p>
                    </div>
                  </div>
                ) : acceptedApplications.length > 0 ? (
                  <ApplicationsTable applications={acceptedApplications} showActions={false} />
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-base font-medium mb-2">Nenhum candidato aceito</h3>
                      <p className="text-sm text-muted-foreground">
                        Ainda não há candidatos aprovados para esta pesquisa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplicationDetailModal />
    </>
  );
}