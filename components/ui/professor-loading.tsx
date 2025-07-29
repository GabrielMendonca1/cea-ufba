"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Loader2, CheckCircle, X } from "lucide-react";
import { Button } from "./button";

interface ProfessorLoadingProps {
  isOpen: boolean;
  currentStep: string;
  onClose: () => void;
}

export function ProfessorLoadingIndicator({ 
  isOpen, 
  currentStep,
  onClose,
}: ProfessorLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = useMemo(() => [
    'Conectando ao sistema UFBA...',
    'Validando credenciais acadêmicas...',
    'Verificando status docente...',
    'Finalizando validação...'
  ], []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentStep) {
      const stepIndex = steps.indexOf(currentStep);
      if (stepIndex !== -1) {
        const newProgress = ((stepIndex + 1) / steps.length) * 100;
        setProgress(newProgress);
      }
    }
  }, [currentStep, steps]);

  if (!isOpen && !isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md border-2 border-blue-200 dark:border-blue-800 shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
          <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
            🎓 Validação de Professor UFBA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Verificando suas credenciais com o sistema acadêmico da UFBA...
            </p>
            
            <div className="space-y-3">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {currentStep || 'Iniciando validação...'}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                📋 Etapas da Validação:
              </h4>
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isCurrentStep = step === currentStep;
                  const isCompleted = steps.indexOf(currentStep) > index;
                  
                  return (
                    <div 
                      key={index}
                      className={`flex items-center gap-2 text-xs ${
                        isCurrentStep 
                          ? 'text-blue-700 dark:text-blue-300 font-medium' 
                          : isCompleted
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      ) : isCurrentStep ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-300" />
                      )}
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <p className="font-medium mb-1">⏱️ Tempo estimado: 30-60 segundos</p>
              <p>Por favor, aguarde enquanto validamos suas informações.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function professorLoading() {
  /* Return a generic full-page spinner instead of the professor-specific modal.
     This avoids confusion when generic data-loading states call this helper. */
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
} 