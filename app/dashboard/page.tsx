"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRole } from "@/contexts/role-context"; // Import useRole

// Placeholder component for Student Dashboard
const StudentDashboard = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold tracking-tight">Painel do Aluno</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Meus Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você está inscrito em 3 cursos.</p>
          {/* Placeholder for course list */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progresso Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Última atividade: Aula 5 de "Introdução à IA".</p>
          {/* Placeholder for progress */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Próximas Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Entrega do Projeto Final - 20/12/2024</p>
          {/* Placeholder for tasks */}
        </CardContent>
      </Card>
    </div>
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Visão Geral dos Cursos</CardTitle>
        <CardDescription>
          Gráficos e dados sobre seu progresso nos cursos.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          (Placeholder: Gráfico de Progresso do Aluno)
        </div>
      </CardContent>
    </Card>
  </div>
);

// Placeholder component for Teacher Dashboard
const TeacherDashboard = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold tracking-tight">Painel do Professor</h2>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cursos Ministrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você está ministrando 2 cursos.</p>
          {/* Placeholder for course list */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alunos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>150 alunos ativos em seus cursos.</p>
          {/* Placeholder for student stats */}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Novas Submissões</CardTitle>
        </CardHeader>
        <CardContent>
          <p>5 novas submissões aguardando avaliação.</p>
          {/* Placeholder for submissions */}
        </CardContent>
      </Card>
    </div>
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle>Visão Geral das Turmas</CardTitle>
        <CardDescription>
          Desempenho e engajamento dos alunos.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          (Placeholder: Gráfico de Desempenho da Turma)
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function DashboardPage() {
  const { role } = useRole(); // Get the current role

  return (
    <div className="container mx-auto py-6 px-4 flex-1">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard ({role === 'student' ? 'Aluno' : 'Professor'})
          </h1>
        </div>

        {role === 'student' ? <StudentDashboard /> : <TeacherDashboard />}
      </div>
    </div>
  );
} 