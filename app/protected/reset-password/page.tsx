"use client";

import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/forms/form-message";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidatedInput } from "@/components/form-validation";
import { useState } from "react";
import { Lock, Shield, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
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

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Redefinir Senha
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Digite sua nova senha abaixo
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-6">
              <ValidatedInput
                name="password"
                type="password"
                label="Nova Senha"
                placeholder="Digite sua nova senha"
                icon={<Lock className="w-4 h-4" />}
                required
                validationRules={passwordValidation}
                className="border-gray-300 focus:border-blue-500"
                onValidChange={(isValid) => {
                  if (isValid) {
                    const input = document.querySelector('input[name="password"]') as HTMLInputElement;
                    if (input) setPassword(input.value);
                  }
                }}
              />

              <div className="space-y-2">
                <ValidatedInput
                  name="confirmPassword"
                  type="password"
                  label="Confirmar Nova Senha"
                  placeholder="Digite novamente sua nova senha"
                  icon={<Lock className="w-4 h-4" />}
                  required
                  validationRules={[
                    {
                      test: (value: string) => value.length > 0,
                      message: "Confirmação de senha é obrigatória"
                    },
                    {
                      test: (value: string) => {
                        const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
                        return !passwordInput || value === passwordInput.value;
                      },
                      message: "As senhas não coincidem"
                    }
                  ]}
                  className="border-gray-300 focus:border-blue-500"
                  onValidChange={(isValid) => {
                    if (isValid) {
                      const input = document.querySelector('input[name="confirmPassword"]') as HTMLInputElement;
                      if (input) setConfirmPassword(input.value);
                    }
                  }}
                />

                {/* Password match indicator */}
                {passwordsMatch && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-3 h-3" />
                    <span>As senhas coincidem</span>
                  </div>
                )}
              </div>

              {/* Security guidelines */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Dicas para uma senha forte:</p>
                    <ul className="space-y-1">
                      <li>• Pelo menos 6 caracteres</li>
                      <li>• Combine letras, números e símbolos</li>
                      <li>• Evite informações pessoais</li>
                      <li>• Use uma senha única</li>
                    </ul>
                  </div>
                </div>
              </div>

              <SubmitButton 
                formAction={resetPasswordAction}
                pendingText="Atualizando senha..."
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                Redefinir Senha
              </SubmitButton>

              {message && <FormMessage message={message} />}

              {message && 'success' in message && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-700 dark:text-green-300">
                      <p className="font-medium">Senha atualizada com sucesso!</p>
                      <p className="text-xs mt-1">Agora você pode fazer login com sua nova senha.</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
