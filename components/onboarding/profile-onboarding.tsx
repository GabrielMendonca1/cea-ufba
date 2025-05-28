"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Building, 
  BookOpen, 
  FileText, 
  Link, 
  Upload,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle
} from "lucide-react";
import { updateUserProfile } from "@/utils/supabase/user-profile";

interface ProfileOnboardingProps {
  userType: 'student' | 'professor';
  userName?: string;
  currentProfile: any;
  onComplete: () => void;
}

// Lista de departamentos da UFBA
const DEPARTMENTS = [
  "Instituto de Física",
  "Instituto de Química", 
  "Instituto de Matemática",
  "Instituto de Biologia",
  "Instituto de Geociências",
  "Faculdade de Medicina",
  "Faculdade de Odontologia",
  "Escola de Enfermagem",
  "Faculdade de Farmácia",
  "Escola Politécnica",
  "Instituto de Computação",
  "Faculdade de Arquitetura",
  "Faculdade de Educação",
  "Instituto de Letras",
  "Faculdade de Filosofia e Ciências Humanas",
  "Faculdade de Comunicação",
  "Escola de Teatro",
  "Escola de Música",
  "Escola de Dança",
  "Escola de Belas Artes",
  "Faculdade de Direito",
  "Faculdade de Economia",
  "Escola de Administração",
  "Instituto de Ciência Política",
  "Instituto de Psicologia",
  "Escola de Medicina Veterinária",
  "Instituto de Saúde Coletiva"
];

// Áreas de pesquisa comuns
const RESEARCH_AREAS = [
  "Inteligência Artificial",
  "Biotecnologia",
  "Medicina Tropical",
  "Engenharia de Software",
  "Nanotecnologia",
  "Neurociências",
  "Genética",
  "Física Teórica",
  "Química Orgânica",
  "Matemática Aplicada",
  "Educação",
  "Linguística",
  "História",
  "Sociologia",
  "Psicologia Cognitiva",
  "Direito Constitucional",
  "Economia",
  "Administração",
  "Arquitetura Sustentável",
  "Saúde Pública",
  "Medicina Preventiva",
  "Farmacologia",
  "Odontologia Restauradora",
  "Enfermagem Obstétrica"
];

interface FormData {
  department: string;
  research_area: string;
  bio: string;
  lattes_url: string;
  avatar_url: string;
}

export default function ProfileOnboarding({ 
  userType, 
  userName, 
  currentProfile,
  onComplete 
}: ProfileOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    department: currentProfile?.department || "",
    research_area: currentProfile?.research_area || "",
    bio: currentProfile?.bio || "",
    lattes_url: currentProfile?.lattes_url || "",
    avatar_url: currentProfile?.avatar_url || ""
  });

  const isStudent = userType === 'student';
  const totalSteps = isStudent ? 3 : 4; // Estudantes: Departamento, Bio, Avatar | Professores: Departamento, Pesquisa, Bio, Avatar

  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Departamento
        if (!formData.department) {
          newErrors.department = "Departamento é obrigatório";
        }
        break;
      
      case 1: // Área de pesquisa (só para professores) ou Bio (para estudantes)
        if (!isStudent) {
          if (!formData.research_area) {
            newErrors.research_area = "Área de pesquisa é obrigatória";
          }
        } else {
          if (!formData.bio || formData.bio.length < 20) {
            newErrors.bio = "Bio deve ter pelo menos 20 caracteres";
          }
        }
        break;
      
      case 2: // Bio (para professores) ou Avatar (para estudantes)
        if (!isStudent) {
          if (!formData.bio || formData.bio.length < 20) {
            newErrors.bio = "Bio deve ter pelo menos 20 caracteres";
          }
        }
        break;
      
      case 3: // Avatar/Lattes (só para professores)
        if (!isStudent) {
          if (formData.lattes_url && !isValidUrl(formData.lattes_url)) {
            newErrors.lattes_url = "URL do Lattes inválida";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      await updateUserProfile({
        department: formData.department,
        research_area: formData.research_area || undefined,
        bio: formData.bio,
        lattes_url: formData.lattes_url || undefined,
        avatar_url: formData.avatar_url || undefined,
        is_profile_complete: true,
        has_completed_onboarding: true
      });
      
      onComplete();
    } catch (error) {
      console.error('Error completing profile:', error);
      setErrors({ general: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Departamento</h2>
              <p className="text-muted-foreground">
                Selecione seu departamento na UFBA
              </p>
            </div>
            
            <div>
              <Label htmlFor="department">Departamento *</Label>
              <Select 
                id="department"
                value={formData.department} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                className={errors.department ? "border-red-500" : ""}
              >
                <option value="" disabled>Selecione seu departamento</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.department}
                </p>
              )}
            </div>
          </div>
        );

      case 1:
        if (!isStudent) {
          // Área de pesquisa para professores
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold">Área de Pesquisa</h2>
                <p className="text-muted-foreground">
                  Qual sua principal área de pesquisa?
                </p>
              </div>
              
              <div>
                <Label htmlFor="research_area">Área de Pesquisa *</Label>
                <Select 
                  id="research_area"
                  value={formData.research_area} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, research_area: e.target.value }))}
                  className={errors.research_area ? "border-red-500" : ""}
                >
                  <option value="" disabled>Selecione sua área de pesquisa</option>
                  {RESEARCH_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </Select>
                {errors.research_area && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.research_area}
                  </p>
                )}
              </div>
            </div>
          );
        } else {
          // Bio para estudantes
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold">Sobre Você</h2>
                <p className="text-muted-foreground">
                  Conte um pouco sobre seus interesses acadêmicos
                </p>
              </div>
              
              <div>
                <Label htmlFor="bio">Biografia *</Label>
                <Textarea
                  id="bio"
                  placeholder="Descreva seus interesses, objetivos acadêmicos e experiências..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className={`min-h-[120px] ${errors.bio ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/200+ caracteres (mínimo 20)
                </p>
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>
          );
        }

      case 2:
        if (!isStudent) {
          // Bio para professores
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <FileText className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold">Biografia Acadêmica</h2>
                <p className="text-muted-foreground">
                  Descreva sua experiência e linha de pesquisa
                </p>
              </div>
              
              <div>
                <Label htmlFor="bio">Biografia *</Label>
                <Textarea
                  id="bio"
                  placeholder="Descreva sua formação, experiência acadêmica, linha de pesquisa..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className={`min-h-[120px] ${errors.bio ? "border-red-500" : ""}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.bio.length}/200+ caracteres (mínimo 20)
                </p>
                {errors.bio && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.bio}
                  </p>
                )}
              </div>
            </div>
          );
        } else {
          // Avatar para estudantes
          return (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h2 className="text-xl font-semibold">Foto de Perfil</h2>
                <p className="text-muted-foreground">
                  Adicione uma foto para seu perfil (opcional)
                </p>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar_url} alt="Avatar" />
                  <AvatarFallback>
                    {userName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <Label htmlFor="avatar_url">URL da Foto (opcional)</Label>
                  <Input
                    id="avatar_url"
                    type="url"
                    placeholder="https://exemplo.com/foto.jpg"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cole o link de uma foto sua ou deixe em branco para usar as iniciais
                  </p>
                </div>
              </div>
            </div>
          );
        }

      case 3:
        // Lattes e Avatar para professores
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Link className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Perfil Acadêmico</h2>
              <p className="text-muted-foreground">
                Links e foto de perfil (opcional)
              </p>
            </div>
            
            <div>
              <Label htmlFor="lattes_url">Currículo Lattes (opcional)</Label>
              <Input
                id="lattes_url"
                type="url"
                placeholder="http://lattes.cnpq.br/1234567890123456"
                value={formData.lattes_url}
                onChange={(e) => setFormData(prev => ({ ...prev, lattes_url: e.target.value }))}
                className={errors.lattes_url ? "border-red-500" : ""}
              />
              {errors.lattes_url && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lattes_url}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar_url} alt="Avatar" />
                <AvatarFallback>
                  {userName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="w-full">
                <Label htmlFor="avatar_url">URL da Foto (opcional)</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://exemplo.com/foto.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Complete seu Perfil
          </h1>
          <p className="text-lg text-muted-foreground">
            {userName ? `Olá, ${userName}!` : ''} Vamos configurar seu perfil como {isStudent ? 'estudante' : 'professor'}
          </p>
          <p className="text-sm text-muted-foreground">
            Sua função: <span className="font-medium text-blue-600">{isStudent ? 'Aluno' : 'Professor'}</span>
          </p>
          <Badge variant="outline" className="mt-2">
            Passo {currentStep + 1} de {totalSteps}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            {renderStep()}

            {/* Error Message */}
            {errors.general && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.general}
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              <Button
                onClick={handleNext}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  "Salvando..."
                ) : currentStep === totalSteps - 1 ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 