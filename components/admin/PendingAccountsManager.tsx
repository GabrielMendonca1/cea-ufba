"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface PendingProfile {
  id: string;
  full_name: string | null;
  email: string;
  department: string | null;
  research_area: string | null;
  account_status: "pending" | "approved" | "rejected" | null;
  created_at: string;
}

interface PendingAccountsManagerProps {
  initialPending: PendingProfile[];
}

export default function PendingAccountsManager({ initialPending }: PendingAccountsManagerProps) {
  const [pendingAccounts, setPendingAccounts] = useRealtimeTable<PendingProfile>(
    "user_profiles",
    initialPending,
    {
      filter: "account_status=eq.pending",
      onUpdate(updated) {
        // Remove from list if status becomes approved/rejected
        if (updated.account_status !== "pending") {
          setPendingAccounts((prev) => prev.filter((p) => p.id !== updated.id));
        }
      },
    },
  );

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (userId: string, action: "approve" | "reject") => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/update-professor-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Falha ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating professor status", error);
      alert("Erro inesperado");
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingAccounts.length === 0) {
    return <p className="text-muted-foreground">Nenhuma conta pendente no momento.</p>;
  }

  return (
    <div className="grid gap-4">
      {pendingAccounts.map((profile) => (
        <Card key={profile.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>{profile.full_name || profile.email}</CardTitle>
            <CardDescription>{profile.department || "Departamento não informado"}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-sm">
                Área de pesquisa: {profile.research_area || "Não informada"}
              </p>
              <p className="text-xs text-gray-500">
                Criado em {new Date(profile.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAction(profile.id, "approve")}
                disabled={processingId === profile.id}
                className="gap-1"
              >
                {processingId === profile.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Aprovar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleAction(profile.id, "reject")}
                disabled={processingId === profile.id}
                className="gap-1"
              >
                {processingId === profile.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 