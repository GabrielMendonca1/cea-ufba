"use client";

import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ValidatedInput } from "@/components/forms/form-validation";
import { SuccessPopup } from "@/components/ui/success-popup";
import Link from "next/link";
import { GraduationCap, Mail, Lock, LogIn, Shield, AlertTriangle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Login() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"success" | "info" | "warning">("info");
  
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

  // Show popup for important messages (like email not confirmed)
  useEffect(() => {
    if (message) {
      if ('error' in message && message.error.includes('não foi confirmada')) {
        setPopupMessage(message.error);
        setPopupType("warning");
        setShowMessagePopup(true);
      } else if ('success' in message) {
        setPopupMessage(message.success);
        setPopupType("success");
        setShowMessagePopup(true);
      }
    }
  }, [message]);

  const handleClosePopup = () => {
    setShowMessagePopup(false);
    // Clear the message parameters from URL
    const params = new URLSearchParams(searchParams);
    params.delete('error');
    params.delete('success');
    params.delete('message');
    router.replace(`/sign-in${params.toString() ? '?' + params.toString() : ''}`);
  };

  // Define validation rules locally
  const emailValidation = [
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: "Formato de email inválido"
    }
  ];
  
  return (
    <>
      <SuccessPopup
        isOpen={showMessagePopup}
        onClose={handleClosePopup}
        title={popupType === "warning" ? "⚠️ Email Não Confirmado" : 
               popupType === "success" ? "✅ Sucesso" : "ℹ️ Informação"}
        message={popupMessage}
        type={popupType}
      />

      <div className="min-h-screen flex items-center justify-center p-4 mb-6">
        <div className="w-full max-w-md">
          {/* Welcome Message for First-time Users */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
              <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Bem-vindo ao CEA UFBA
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Explore oportunidades de pesquisa e conecte-se com a comunidade acadêmica
              </p>
            </div>
          </div>
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
                <LogIn className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Entrar
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Acesse sua conta CEA UFBA
                </CardDescription>
              </div>
              <Badge variant="outline" className="mx-auto">
                Centro de Estudos Avançados
              </Badge>
            </CardHeader>

            <CardContent>
              <form className="space-y-6" action={signInAction}>
                <div className="space-y-4">
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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Senha <span className="text-red-500">*</span>
                      </span>
                      <Link
                        className="text-xs text-blue-600 hover:underline"
                        href="/forgot-password"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <ValidatedInput
                      name="password"
                      type="password"
                      label=""
                      placeholder="Sua senha"
                      required
                      validationRules={[
                        {
                          test: (value: string) => value.length > 0,
                          message: "Senha é obrigatória"
                        }
                      ]}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Security notice */}
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-700 dark:text-green-300">
                      <p className="font-medium">Conexão segura</p>
                      <p>Seus dados estão protegidos com criptografia SSL</p>
                    </div>
                  </div>
                </div>

                {/* Email confirmation info */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Primeira vez fazendo login?</p>
                      <p>Certifique-se de ter confirmado seu email clicando no link que enviamos após o cadastro.</p>
                    </div>
                  </div>
                </div>

                <SubmitButton 
                  pendingText="Entrando..." 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  Entrar
                </SubmitButton>

                {/* Only show non-critical error messages inline, important ones will be in popup */}
                {message && 'error' in message && !message.error.includes('não foi confirmada') && (
                  <FormMessage message={message} />
                )}

                {/* Troubleshooting tips */}
                {message && 'error' in message && !message.error.includes('não foi confirmada') && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-orange-700 dark:text-orange-300">
                        <p className="font-medium mb-1">Problemas para entrar?</p>
                        <ul className="space-y-1">
                          <li>• Verifique se o email está correto</li>
                          <li>• Certifique-se de que o Caps Lock está desligado</li>
                          <li>• Confirme se sua conta foi verificada por email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-2">
                  <Separator />
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{" "}
                    <Link className="text-blue-600 font-medium hover:underline" href="/sign-up">
                      Criar conta
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Primeiro acesso?{" "}
                    <Link className="text-blue-600 hover:underline" href="/sign-up">
                      Cadastre-se aqui
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
