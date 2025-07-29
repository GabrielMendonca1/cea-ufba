import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Mail, Calendar, Shield, BookOpen, Users, FileText, GraduationCap, Building, MapPin, Clock } from "lucide-react";
import { getDashboardData } from "@/lib/queries";
import { EditProfileForm } from "@/components/forms/EditProfileForm";
import { ResearchOpportunityManager } from "@/components/research/ResearchOpportunityManager";
import { PostManager } from "@/components/posts/PostManager";

/**
 * Dashboard Page Component
 * This page displays user-specific dashboard content based on their role.
 * Only authenticated users can access this page.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔍 [DEBUG] User data:", user);

  // Note: User redirect is temporarily disabled for debugging
  // Uncomment the following lines to enforce authentication:
  // if (!user) {
  //   return redirect("/sign-in");
  // }

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="p-6 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 font-medium">No user found. You may need to sign in.</p>
        </div>
      </div>
    );
  }

  // Extract user information
  const userEmail = user.email || 'Not provided';
  const userId = user.id;
  const emailConfirmed = user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString() : 'Not confirmed';
  
  // Get all dashboard data using our query functions with Promise.all() optimization
  const [dashboardData] = await Promise.all([
    getDashboardData(user),
  ]);

  const { userProfile, researchOpportunities, applications, stats } = dashboardData;

  // Get the actual user type from the database (user_profiles table)
  const userType = userProfile?.user_type || 'student';
  const role = userType; // Use the user type from database
  const accountStatus = userProfile?.account_status || 'pending';

  // Check if professor account is pending approval
  if (userType === 'professor' && accountStatus !== 'approved') {
    return (
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="max-w-md p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-amber-800 mb-2">
              Conta Pendente de Aprovação
            </h2>
            <p className="text-amber-700 mb-4">
              Sua conta de professor está aguardando aprovação da administração. 
              Este processo pode levar de 1 a 3 dias úteis.
            </p>
            <div className="text-sm text-amber-600">
              <p><strong>Status atual:</strong> {accountStatus === 'pending' ? 'Pendente' : 
                accountStatus === 'rejected' ? 'Rejeitada' : 'Desconhecido'}</p>
              <p><strong>Próximos passos:</strong> Aguarde o contato da equipe administrativa</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("🔍 [DEBUG] Extracted user info:", {
    userEmail,
    userId,
    userType,
    role,
    userProfile: userProfile
  });

  return (
    <div className="container mx-auto py-6 px-4 flex-1">
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {userProfile?.full_name || "Usuário"}!
          </h1>
        </div>

        {/* User Profile Section with Edit Button - Hide for admins */}
        {role !== "admin" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-2xl">Informações do Perfil</h2>
              <EditProfileForm userProfile={userProfile} userEmail={userEmail} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Email Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{userEmail}</div>
                <p className="text-xs text-muted-foreground">
                  Confirmado: {emailConfirmed}
                </p>
              </CardContent>
            </Card>

            {/* Full Name Card (from profile) */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome Completo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {userProfile?.full_name || "Não informado"}
                </div>
                <p className="text-xs text-muted-foreground">Nome de exibição</p>
              </CardContent>
            </Card>

            {/* User Type Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Tipo de Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold capitalize">
                  {userType === 'admin' ? 'Administrador' :
                   userType === 'professor' ? 'Professor' : 'Estudante'}
                </div>
                <p className="text-xs text-muted-foreground">Tipo de conta</p>
              </CardContent>
            </Card>

            {/* Department Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Departamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {userProfile?.department || "Não especificado"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Departamento acadêmico
                </p>
              </CardContent>
            </Card>

            {/* Research Area Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Área de Pesquisa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {userProfile?.research_area || "Não especificado"}
                </div>
                <p className="text-xs text-muted-foreground">Campo de estudo</p>
              </CardContent>
            </Card>

            {/* Bio Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Biografia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  {userProfile?.bio || "Nenhuma biografia fornecida"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Informações pessoais
                </p>
              </CardContent>
            </Card>

            {/* Student ID Card (for students) */}
            {userProfile?.user_type === "student" && (
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Matrícula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {userProfile?.student_id || "Não informado"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registro universitário
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Lattes URL Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Currículo Lattes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile?.lattes_url ? (
                  <a
                    href={userProfile.lattes_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Ver Currículo
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Não informado
                  </span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Currículo acadêmico
                </p>
              </CardContent>
            </Card>

            {/* Profile Completion Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Status do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-lg font-bold ${userProfile?.is_profile_complete ? "text-green-600" : "text-orange-600"}`}
                >
                  {userProfile?.is_profile_complete ? "Completo" : "Incompleto"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Status de conclusão do perfil
                </p>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {/* Role-specific content */}
        {role === "admin" ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Painel Administrativo
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Gerencie contas de professores, aprove solicitações e monitore o sistema.
              </p>
              <a 
                href="/dashboard/admin" 
                className="inline-flex items-center justify-center rounded-md text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 py-3"
              >
                <Shield className="w-5 h-5 mr-2" />
                Acessar Painel Admin
              </a>
            </div>
          </div>
        ) : role === "professor" ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Dashboard do Professor
            </h2>

            {/* Research Opportunities Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Oportunidades de Pesquisa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalResearch}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Projetos de pesquisa ativos que você está supervisionando
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Candidaturas Recebidas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalApplications}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Candidaturas de estudantes para revisar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Revisões Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Candidaturas aguardando sua decisão
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Research Opportunity Management */}
            <ResearchOpportunityManager 
              userId={userId} 
            />

            {/* Post Management */}
            <PostManager userId={userId} />

            {/* Recent Applications */}
            {applications && applications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Recent Applications
                </h3>
                <div className="grid gap-4">
                  {applications.slice(0, 5).map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {application.research_opportunities?.title}
                        </CardTitle>
                        <CardDescription>
                          Application from{" "}
                          {application.user_profiles?.full_name ||
                            application.user_profiles?.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status?.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              application.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Dashboard do Estudante
            </h2>

            {/* Student Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Minhas Candidaturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalApplications}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Candidaturas de pesquisa enviadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Candidaturas Pendentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.pendingApplications}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Aguardando revisão do professor
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Candidaturas Aceitas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.acceptedApplications}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Candidaturas aprovadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Student Applications */}
            {applications && applications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">My Applications</h3>
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {application.research_opportunities?.title}
                        </CardTitle>
                        <CardDescription>
                          {application.research_opportunities?.research_area}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              application.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status?.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Applied:{" "}
                            {new Date(
                              application.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 