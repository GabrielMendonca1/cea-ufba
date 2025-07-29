import { createClient } from "@/utils/supabase/server";
import AdminDashboardTabs from "@/components/admin/AdminDashboardTabs";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user profile to check user type from database
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single();

  const userRole = userProfile?.user_type || "student";

  if (userRole !== "admin") {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-semibold text-red-600">Acesso negado</h1>
        <p>Você precisa ter privilégios de administrador para visualizar esta página.</p>
      </div>
    );
  }

  // Fetch all professor accounts by status
  const [
    { data: pendingProfiles, error: pendingError },
    { data: approvedProfiles, error: approvedError }, 
    { data: rejectedProfiles, error: rejectedError },
    { data: allUsers, error: usersError }
  ] = await Promise.all([
    supabase
      .from("user_profiles")
      .select("id, full_name, email, department, research_area, account_status, created_at, user_type")
      .eq("user_type", "professor")
      .eq("account_status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("user_profiles")
      .select("id, full_name, email, department, research_area, account_status, created_at, user_type")
      .eq("user_type", "professor")
      .eq("account_status", "approved")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_profiles")
      .select("id, full_name, email, department, research_area, account_status, created_at, user_type")
      .eq("user_type", "professor")
      .eq("account_status", "rejected")
      .order("created_at", { ascending: false }),
    supabase
      .from("user_profiles")
      .select("id, full_name, email, department, research_area, account_status, created_at, user_type")
      .order("created_at", { ascending: false })
  ]);

  if (pendingError || approvedError || rejectedError || usersError) {
    console.error("Failed to fetch data:", { pendingError, approvedError, rejectedError, usersError });
  }

  return (
    <div className="container mx-auto py-6 px-4 flex-1">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Painel de Administração
      </h1>
      <AdminDashboardTabs 
        pendingProfiles={pendingProfiles || []}
        approvedProfiles={approvedProfiles || []}
        rejectedProfiles={rejectedProfiles || []}
        allUsers={allUsers || []}
      />
    </div>
  );
} 