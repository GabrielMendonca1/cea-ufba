import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  return withAuth(async (authenticatedRequest) => {
    try {
      // Check if current user is admin
      const supabase = await createClient();
      const { data: currentUser } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("id", authenticatedRequest.user.id)
        .single();

      if (!currentUser || currentUser.user_type !== "admin") {
        return NextResponse.json(
          { error: "Only administrators can view pending professors" },
          { status: 403 }
        );
      }

      // Get pending professors
      const { data: pendingProfessors, error } = await supabase
        .from("user_profiles")
        .select(`
          id,
          email,
          full_name,
          department,
          research_area,
          lattes_url,
          account_status,
          created_at
        `)
        .eq("user_type", "professor")
        .eq("account_status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending professors:", error);
        return NextResponse.json(
          { error: "Failed to fetch pending professors" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        professors: pendingProfessors || [],
        total: pendingProfessors?.length || 0,
      });

    } catch (error) {
      console.error("Error in pending professors endpoint:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  })(request);
}