"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  department: string | null;
  research_area: string | null;
  account_status: "pending" | "approved" | "rejected" | null;
  created_at: string;
  user_type: "student" | "professor" | "admin";
}

interface ApprovedAccountsListProps {
  accounts: Profile[];
}

export default function ApprovedAccountsList({ accounts }: ApprovedAccountsListProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum professor aprovado ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {accounts.map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile.full_name || profile.email}
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Aprovado
                  </Badge>
                </CardTitle>
                <CardDescription>{profile.department || "Departamento não informado"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-sm">
                <strong>Área de pesquisa:</strong> {profile.research_area || "Não informada"}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Aprovado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}