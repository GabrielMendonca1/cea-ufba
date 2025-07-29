"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Calendar, RotateCcw } from "lucide-react";
import { useState } from "react";

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

interface RejectedAccountsListProps {
  accounts: Profile[];
}

export default function RejectedAccountsList({ accounts }: RejectedAccountsListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleReactivate = async (userId: string) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/update-professor-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "approve" }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Falha ao reativar conta");
      } else {
        window.location.reload(); // Refresh to update the lists
      }
    } catch (error) {
      console.error("Error reactivating account", error);
      alert("Erro inesperado");
    } finally {
      setProcessingId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8">
        <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum professor rejeitado.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {accounts.map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile.full_name || profile.email}
                  <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejeitado
                  </Badge>
                </CardTitle>
                <CardDescription>{profile.department || "Departamento não informado"}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReactivate(profile.id)}
                disabled={processingId === profile.id}
                className="gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reativar
              </Button>
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
                Rejeitado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}