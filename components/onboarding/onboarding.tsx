"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Target, 
  CheckCircle,
  ArrowRight,
  User,
  Briefcase
} from "lucide-react";

interface OnboardingProps {
  userType: 'student' | 'teacher';
  userName?: string;
  onComplete: () => void;
}

const studentSteps = [
  {
    id: 1,
    title: "Explore Oportunidades de Pesquisa",
    description: "Descubra mais de 100 oportunidades de pesquisa em diversas áreas",
    icon: BookOpen,
    areas: ["Inteligência Artificial", "Biotecnologia", "Medicina Tropical", "Engenharia de Software"],
    stats: "100+ oportunidades disponíveis"
  },
  {
    id: 2,
    title: "Entenda os Tipos de Bolsa",
    description: "Conheça os diferentes tipos de bolsas de pesquisa oferecidas",
    icon: Award,
    areas: ["PIBIC", "PIBITI", "PIBIC-EM", "PIBIT", "Iniciação Científica Voluntária"],
    stats: "5 tipos de bolsa"
  },
  {
    id: 3,
    title: "Conecte-se com Professores",
    description: "Entre em contato com orientadores experientes",
    icon: Users,
    areas: ["Instituto de Física", "Instituto de Química", "Faculdade de Medicina", "Escola Politécnica"],
    stats: "10+ departamentos"
  },
  {
    id: 4,
    title: "Comece sua Jornada",
    description: "Candidate-se às pesquisas que mais despertam seu interesse",
    icon: Target,
    areas: ["Networking", "Experiência Prática", "Publicações", "Preparação para Pós-graduação"],
    stats: "Oportunidades únicas"
  }
];

const teacherSteps = [
  {
    id: 1,
    title: "Publique suas Oportunidades",
    description: "Compartilhe suas pesquisas e atraia os melhores estudantes",
    icon: Briefcase,
    areas: ["Definir Objetivos", "Descrever Metodologia", "Especificar Requisitos", "Estabelecer Cronograma"],
    stats: "Visibilidade para 1000+ alunos"
  },
  {
    id: 2,
    title: "Gerencie Candidaturas",
    description: "Avalie e selecione candidatos qualificados",
    icon: Users,
    areas: ["Análise de CV", "Entrevistas", "Avaliação de Perfil", "Seleção Final"],
    stats: "Sistema integrado de avaliação"
  },
  {
    id: 3,
    title: "Acompanhe o Progresso",
    description: "Monitore o desenvolvimento dos seus orientandos",
    icon: Target,
    areas: ["Relatórios Regulares", "Avaliações", "Metas", "Feedback Contínuo"],
    stats: "Dashboard de acompanhamento"
  },
  {
    id: 4,
    title: "Construa sua Rede",
    description: "Conecte-se com outros pesquisadores e expanda sua rede",
    icon: GraduationCap,
    areas: ["Colaborações", "Publicações Conjuntas", "Eventos", "Parcerias"],
    stats: "Rede de pesquisadores UFBA"
  }
];

export default function Onboarding({ userType, userName, onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const steps = userType === 'student' ? studentSteps : teacherSteps;
  const isStudent = userType === 'student';
  
  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinish = () => {
    onComplete();
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isCompleted = completedSteps.includes(currentStepData.id);
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            {isStudent ? (
              <User className="w-8 h-8 text-blue-600" />
            ) : (
              <GraduationCap className="w-8 h-8 text-blue-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo{userName ? `, ${userName}` : ''}!
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Vamos configurar sua experiência como {isStudent ? 'aluno' : 'professor'} na plataforma CEA UFBA
          </p>
          <Badge variant="outline" className="mt-2">
            {isStudent ? 'Estudante' : 'Professor'} • Passo {currentStep + 1} de {steps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progresso</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = completedSteps.includes(step.id);
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-100 border-green-500 text-green-600'
                      : isActive
                      ? 'bg-blue-100 border-blue-500 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-4">
              <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-lg">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <Badge variant="secondary" className="text-sm">
                {currentStepData.stats}
              </Badge>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold mb-3 text-center">
                {isStudent ? 'Áreas de Interesse:' : 'Funcionalidades Principais:'}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {currentStepData.areas.map((area, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-4 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Anterior
                </Button>
              )}
              
              <Button
                onClick={() => isLastStep ? handleFinish() : handleStepComplete(currentStepData.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLastStep ? 'Finalizar' : 'Próximo'}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Você pode pular este tutorial a qualquer momento e acessar essas informações 
            novamente na seção de ajuda.
          </p>
          <Button variant="ghost" size="sm" onClick={onComplete} className="mt-2">
            Pular tutorial
          </Button>
        </div>
      </div>
    </div>
  );
} 