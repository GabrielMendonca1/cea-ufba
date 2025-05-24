"use client";

import { forgotPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidatedInput } from "@/components/form-validation";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { Mail, ArrowLeft, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ForgotPassword() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Recuperar Senha
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Digite seu email para receber o link de redefinição
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-6">
              <ValidatedInput
                name="email"
                type="email"
                label="Email"
                placeholder="seu.email@ufba.br"
                icon={<Mail className="w-4 h-4" />}
                required
                validationRules={emailValidation}
                className="border-gray-300 focus:border-blue-500"
              />

              {/* Security notice */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Processo seguro:</p>
                    <p>Enviaremos um link seguro para seu email. O link expira em 1 hora.</p>
                  </div>
                </div>
              </div>

              <SubmitButton 
                formAction={forgotPasswordAction}
                pendingText="Enviando..."
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                Enviar Link de Recuperação
              </SubmitButton>

              {message && <FormMessage message={message} />}

              <div className="text-center space-y-2">
                <Link 
                  href="/sign-in" 
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Link>
                <p className="text-xs text-muted-foreground">
                  Não recebeu o email? Verifique sua caixa de spam.
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
