import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GraduationCap, Mail, Lock, LogIn } from "lucide-react";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <form className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input 
                    name="email" 
                    type="email"
                    placeholder="seu.email@ufba.br" 
                    required 
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Senha
                    </Label>
                    <Link
                      className="text-xs text-blue-600 hover:underline"
                      href="/forgot-password"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Sua senha"
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              <SubmitButton 
                pendingText="Entrando..." 
                formAction={signInAction}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                Entrar
              </SubmitButton>

              <FormMessage message={searchParams} />

              <div className="text-center space-y-2">
                <Separator />
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Link className="text-blue-600 font-medium hover:underline" href="/sign-up">
                    Criar conta
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Welcome Message for First-time Users */}
        <div className="mt-6 text-center">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Bem-vindo ao CEA UFBA
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Explore oportunidades de pesquisa e conecte-se com a comunidade acadêmica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
