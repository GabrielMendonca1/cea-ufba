"use client";

import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ValidatedInput } from "@/components/form-validation";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { GraduationCap, User, Mail, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function Signup() {
  const searchParams = useSearchParams();
  
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

  if (message && "message" in message) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={message} />
      </div>
    );
  }

  return (
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
            <form className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Você é: <span className="text-red-500">*</span>
                </Label>
                <RadioGroup name="user_type" required className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                    <RadioGroupItem value="student" id="student" />
                    <Label htmlFor="student" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Aluno</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Graduação ou Pós-graduação
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                    <RadioGroupItem value="professor" id="professor" />
                    <Label htmlFor="professor" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Professor</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Docente ou Pesquisador
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
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

              <SubmitButton 
                formAction={signUpAction} 
                pendingText="Criando conta..."
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                Criar Conta
              </SubmitButton>

              {message && <FormMessage message={message} />}

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
  );
}
