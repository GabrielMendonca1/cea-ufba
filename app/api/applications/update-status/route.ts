import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400 }
      );
    }

    if (!['pending', 'accepted', 'rejected', 'withdrawn'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Verify user has permission to update this application
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        student_id,
        research_opportunities (
          supervisor_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Check if user is either the supervisor or the student
    const isSupervisor = (application.research_opportunities as any)?.supervisor_id === user.id;
    const isStudent = application.student_id === user.id;

    if (!isSupervisor && !isStudent) {
      return NextResponse.json(
        { error: "Forbidden - You can only update applications you supervise or your own applications" },
        { status: 403 }
      );
    }

    // Update the application status
    const { data, error } = await supabase
      .from('applications')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error("Error updating application status:", error);
      return NextResponse.json(
        { error: "Failed to update application status" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 