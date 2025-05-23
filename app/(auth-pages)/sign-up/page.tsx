import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { GraduationCap, User, Mail, Lock, UserCheck } from "lucide-react";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4">
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
                  Você é:
                </Label>
                <RadioGroup name="userType" required className="grid grid-cols-2 gap-4">
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
                    <RadioGroupItem value="teacher" id="teacher" />
                    <Label htmlFor="teacher" className="cursor-pointer flex-1">
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
              </div>

              <Separator />

              {/* Personal Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </Label>
                  <Input 
                    name="fullName" 
                    placeholder="Seu nome completo" 
                    required 
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Institucional
                  </Label>
                  <Input 
                    name="email" 
                    type="email"
                    placeholder="seu.email@ufba.br" 
                    required 
                    className="border-gray-300 focus:border-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recomendamos usar seu email institucional da UFBA
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Crie uma senha segura"
                    minLength={6}
                    required
                    className="border-gray-300 focus:border-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo de 6 caracteres
                  </p>
                </div>
              </div>

              <SubmitButton 
                formAction={signUpAction} 
                pendingText="Criando conta..."
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
              >
                Criar Conta
              </SubmitButton>

              <FormMessage message={searchParams} />

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link className="text-blue-600 font-medium hover:underline" href="/sign-in">
                    Fazer login
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
