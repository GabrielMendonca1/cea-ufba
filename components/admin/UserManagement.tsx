"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Search, 
  User, 
  GraduationCap, 
  Shield, 
  AlertTriangle 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface UserManagementProps {
  users: Profile[];
}

export default function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "professor":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const variants = {
      admin: "default",
      professor: "secondary",
      student: "outline"
    } as const;

    const labels = {
      admin: "Admin",
      professor: "Professor",
      student: "Estudante"
    };

    return (
      <Badge variant={variants[userType as keyof typeof variants] || "outline"}>
        {getUserTypeIcon(userType)}
        <span className="ml-1">{labels[userType as keyof typeof labels] || userType}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variants = {
      approved: "default",
      pending: "secondary", 
      rejected: "destructive"
    } as const;

    const labels = {
      approved: "Aprovado",
      pending: "Pendente",
      rejected: "Rejeitado"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"} className="text-xs">
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Falha ao excluir usuário");
      } else {
        window.location.reload(); // Refresh to update the list
      }
    } catch (error) {
      console.error("Error deleting user", error);
      alert("Erro inesperado");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou departamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.filter(u => u.user_type === "admin").length}</div>
            <div className="text-sm text-muted-foreground">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.filter(u => u.user_type === "professor").length}</div>
            <div className="text-sm text-muted-foreground">Professores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.filter(u => u.user_type === "student").length}</div>
            <div className="text-sm text-muted-foreground">Estudantes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid gap-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium truncate">
                      {user.full_name || user.email}
                    </h3>
                    {getUserTypeBadge(user.user_type)}
                    {getStatusBadge(user.account_status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{user.email}</p>
                    {user.department && (
                      <p><strong>Departamento:</strong> {user.department}</p>
                    )}
                    {user.research_area && (
                      <p><strong>Área:</strong> {user.research_area}</p>
                    )}
                    <p className="text-xs">
                      Criado em {new Date(user.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>

                <div className="ml-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deletingUserId === user.id || user.user_type === "admin"}
                        className="gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          Confirmar Exclusão
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            Tem certeza que deseja excluir o usuário <strong>{user.full_name || user.email}</strong>?
                          </p>
                          <p className="text-red-600 font-medium">
                            Esta ação é irreversível e removerá permanentemente:
                          </p>
                          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                            <li>Dados do perfil do usuário</li>
                            <li>Todas as candidaturas (se estudante)</li>
                            <li>Todas as oportunidades de pesquisa (se professor)</li>
                            <li>Posts e conteúdo relacionado</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? "Excluindo..." : "Excluir Permanentemente"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
          </p>
        </div>
      )}
    </div>
  );
}