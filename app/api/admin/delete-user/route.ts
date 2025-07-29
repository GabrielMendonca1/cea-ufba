import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user and verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    console.log(`🔍 Admin ${user.id} attempting to delete user ${userId}`);

    // Create service client to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if user to delete exists and is not an admin
    const { data: userToDelete } = await serviceSupabase
      .from("user_profiles")
      .select("id, user_type, email, full_name")
      .eq("id", userId)
      .single();

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDelete.user_type === "admin") {
      return NextResponse.json({ error: "Cannot delete admin users" }, { status: 403 });
    }

    console.log(`🗑️ Deleting user: ${userToDelete.email} (${userToDelete.user_type})`);

    // Delete related data first (due to foreign key constraints)
    
    // Delete applications (if student)
    if (userToDelete.user_type === "student") {
      await serviceSupabase
        .from("applications")
        .delete()
        .eq("student_id", userId);
    }

    // Delete research opportunities (if professor)
    if (userToDelete.user_type === "professor") {
      // First delete applications for the professor's opportunities
      const { data: professorOpportunities } = await serviceSupabase
        .from("research_opportunities")
        .select("id")
        .eq("supervisor_id", userId);

      if (professorOpportunities) {
        for (const opportunity of professorOpportunities) {
          await serviceSupabase
            .from("applications")
            .delete()
            .eq("research_opportunity_id", opportunity.id);
        }
      }

      // Delete research opportunities
      await serviceSupabase
        .from("research_opportunities")
        .delete()
        .eq("supervisor_id", userId);

      // Delete scientific outreach posts
      await serviceSupabase
        .from("scientific_outreach")
        .delete()
        .eq("professor_id", userId);
    }

    // Delete user profile
    const { error: profileError } = await serviceSupabase
      .from("user_profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting user profile:", profileError);
      return NextResponse.json(
        { error: "Failed to delete user profile" },
        { status: 500 }
      );
    }

    // Delete auth user (this will cascade to other tables)
    const { error: authDeleteError } = await serviceSupabase.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      // Don't fail the request if auth deletion fails since profile is already deleted
      console.log("⚠️ Auth user deletion failed, but profile was deleted successfully");
    }

    console.log(`✅ Successfully deleted user ${userToDelete.email}`);

    return NextResponse.json({ 
      success: true, 
      message: `User ${userToDelete.email} deleted successfully` 
    });

  } catch (error) {
    console.error("Unexpected error in delete-user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}