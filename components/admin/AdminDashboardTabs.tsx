"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PendingAccountsManager from "@/components/admin/PendingAccountsManager";
import ApprovedAccountsList from "@/components/admin/ApprovedAccountsList";
import RejectedAccountsList from "@/components/admin/RejectedAccountsList";
import UserManagement from "@/components/admin/UserManagement";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";

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

interface AdminDashboardTabsProps {
  pendingProfiles: Profile[];
  approvedProfiles: Profile[];
  rejectedProfiles: Profile[];
  allUsers: Profile[];
}

export default function AdminDashboardTabs({
  pendingProfiles,
  approvedProfiles,
  rejectedProfiles,
  allUsers
}: AdminDashboardTabsProps) {
  return (
    <Tabs defaultValue="pending" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="pending" className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Pendentes
          {pendingProfiles.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {pendingProfiles.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="approved" className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Aprovados
          {approvedProfiles.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {approvedProfiles.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="rejected" className="flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Rejeitados
          {rejectedProfiles.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {rejectedProfiles.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Todos os Usuários
          <Badge variant="secondary" className="ml-1">
            {allUsers.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="pending" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Professores Pendentes de Aprovação</h2>
            <PendingAccountsManager initialPending={pendingProfiles} />
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Professores Aprovados</h2>
            <ApprovedAccountsList accounts={approvedProfiles} />
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Professores Rejeitados</h2>
            <RejectedAccountsList accounts={rejectedProfiles} />
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Gerenciamento de Usuários</h2>
            <p className="text-muted-foreground mb-4">
              Visualize e gerencie todos os usuários do sistema. 
              <span className="font-medium text-red-600"> Cuidado: a exclusão é permanente.</span>
            </p>
            <UserManagement users={allUsers} />
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}