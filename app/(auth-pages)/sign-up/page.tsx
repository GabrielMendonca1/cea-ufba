"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ValidatedInput } from "@/components/forms/form-validation";
import { SuccessPopup } from "@/components/ui/success-popup";
import { ProfessorLoadingIndicator } from "@/components/ui/professor-loading";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { GraduationCap, User, Mail, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Signup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [isProfessorValidating, setIsProfessorValidating] = useState(false);
  const [professorValidationStep, setProfessorValidationStep] = useState("");
  const hasShownPopup = useRef(false);
  
  // Convert URLSearchParams to Message format
  const message: Message | null = (() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    const messageParam = searchParams.get('message');
    
    if (errorParam) return { error: errorParam };
    if (successParam) return { success: successParam };
    if (messageParam) return { message: messageParam };
    return null;
  })();

  // Show popup for success messages - using ref to prevent duplicates
  useEffect(() => {
    const successParam = searchParams.get('success');
    if (successParam && !hasShownPopup.current) {
      setSuccessMessage(successParam);
      setShowSuccessPopup(true);
      hasShownPopup.current = true;
    }
  }, [searchParams]);

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    hasShownPopup.current = false;
    // Clear the success parameter from URL
    const params = new URLSearchParams(searchParams);
    params.delete('success');
    router.replace(`/sign-up${params.toString() ? '?' + params.toString() : ''}`);
  };

  const handleCloseProfessorLoading = () => {
    setIsProfessorValidating(false);
    setProfessorValidationStep("");
  };

  // Custom form submit handler to show loading for professors
  const handleFormSubmit = async (formData: FormData) => {
    const userType = formData.get("user_type")?.toString();
    
    if (userType === 'professor') {
      setIsProfessorValidating(true);
      setProfessorValidationStep("Conectando ao sistema UFBA...");
      
      // Simulate the validation steps for UI feedback
      setTimeout(() => setProfessorValidationStep("Validando credenciais acadêmicas..."), 1000);
      setTimeout(() => setProfessorValidationStep("Verificando status docente..."), 2000);
      setTimeout(() => setProfessorValidationStep("Finalizando validação..."), 3000);
    }
    
    try {
      const result = await signUpAction(formData);
      return result;
    } finally {
      if (userType === 'professor') {
        setIsProfessorValidating(false);
        setProfessorValidationStep("");
      }
    }
  };

  // Define validation rules locally
  const emailValidation = [
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Formato de email inválido"
    }
  ];

  const passwordValidation = [
    {
      test: (value: string) => value.length >= 6,
      message: "A senha deve ter pelo menos 6 caracteres"
    },
    {
      test: (value: string) => value.length <= 128,
      message: "A senha não pode ter mais de 128 caracteres"
    }
  ];

  const nameValidation = [
    {
      test: (value: string) => value.trim().length >= 2,
      message: "Nome deve ter pelo menos 2 caracteres"
    },
    {
      test: (value: string) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value),
      message: "Nome deve conter apenas letras e espaços"
    }
  ];

  // Show non-success messages normally
  if (message && "message" in message) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
    <>
      <SuccessPopup
        isOpen={showSuccessPopup}
        onClose={handleClosePopup}
        title="🎉 Conta Criada com Sucesso!"
        message={successMessage}
        type="success"
      />

      <ProfessorLoadingIndicator
        isOpen={isProfessorValidating}
        currentStep={professorValidationStep}
        onClose={handleCloseProfessorLoading}
      />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Criar Conta
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Junte-se à comunidade acadêmica da UFBA
                </CardDescription>
              </div>
              <Badge variant="outline" className="mx-auto">
                Centro de Estudos Avançados
              </Badge>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" action={signUpAction}>
                {/* User Type Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Você é: <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup 
                    name="user_type" 
                    required 
                    className="grid grid-cols-2 gap-4"
                    onValueChange={setSelectedUserType}
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Aluno</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <RadioGroupItem value="professor" id="professor" />
                      <Label htmlFor="professor" className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Professor</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {/* Professor-specific validation notice */}
                  {selectedUserType === 'professor' && (
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <div className="flex gap-2">
                        <GraduationCap className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-800 dark:text-amber-200">
                          <p className="font-semibold mb-1">🎓 Validação de Professor UFBA</p>
                          <ul className="space-y-1">
                            <li>• Seus dados serão validados com o sistema UFBA</li>
                            <li>• Recomendamos usar email @ufba.br ou @professor.ufba.br</li>
                            <li>• O processo pode levar alguns momentos adicionais</li>
                            <li>• Você receberá confirmação da validação por email</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    Selecione uma opção para continuar
                  </div>
                </div>

                <Separator />

                {/* Personal Information with validation */}
                <div className="space-y-4">
                  <ValidatedInput
                    name="full_name"
                    label="Nome Completo"
                    placeholder="Seu nome completo"
                    icon={<User className="w-4 h-4" />}
                    required
                    validationRules={nameValidation}
                    className="border-gray-300 focus:border-blue-500"
                  />

                  <ValidatedInput
                    name="email"
                    type="email"
                    label="Email Institucional"
                    placeholder="seu.email@ufba.br"
                    icon={<Mail className="w-4 h-4" />}
                    required
                    validationRules={[
                      ...emailValidation,
                      {
                        test: (value: string) => value.includes('@ufba.br') || value.includes('@ufba.edu.br') || !value.includes('@'),
                        message: "Recomendamos usar email @ufba.br para validação mais rápida"
                      }
                    ]}
                    className="border-gray-300 focus:border-blue-500"
                  />

                  <ValidatedInput
                    name="password"
                    type="password"
                    label="Senha"
                    placeholder="Crie uma senha segura"
                    icon={<Lock className="w-4 h-4" />}
                    required
                    validationRules={passwordValidation}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                {/* Security notice */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Dicas de segurança:</p>
                      <ul className="space-y-1">
                        <li>• Use uma senha única e forte</li>
                        <li>• Mantenha seus dados atualizados</li>
                        <li>• Não compartilhe sua conta</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Email confirmation notice */}
                {/* <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-semibold mb-2">📧 Confirmação por Email Obrigatória</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Após o cadastro, você receberá um email de confirmação</li>
                        <li>• Verifique sua <strong>caixa de entrada</strong> e <strong>pasta de spam</strong></li>
                        <li>• Clique no link de confirmação para ativar sua conta</li>
                        <li>• Só será possível fazer login após confirmar o email</li>
                      </ul>
                      <p className="mt-2 text-xs font-medium">
                        💡 Dica: Use seu email @ufba.br para evitar problemas de entrega
                      </p>
                    </div>
                  </div>
                </div> */}

                <SubmitButton 
                  pendingText={selectedUserType === 'professor' ? "Validando com UFBA..." : "Criando conta..."}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  Criar Conta
                </SubmitButton>

                {/* Only show error messages inline, success will be in popup */}
                {message && 'error' in message && <FormMessage message={message} />}

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Já tem uma conta?{" "}
                    <Link className="text-blue-600 font-medium hover:underline" href="/sign-in">
                      Fazer login
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Problemas para acessar?{" "}
                    <Link className="text-blue-600 hover:underline" href="/forgot-password">
                      Recuperar senha
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6">
            <SmtpMessage />
          </div>
        </div>
      </div>
    </>
  );
}
