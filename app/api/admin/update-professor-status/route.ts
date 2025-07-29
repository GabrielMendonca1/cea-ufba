import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";
import { sendProfessorStatusEmail } from "@/lib/email-service";

/**
 * Admin-only endpoint to approve or reject professor accounts.
 *
 * Expects JSON body: { userId: string, action: 'approve' | 'reject' }
 * Returns 200 with updated row on success.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    /* ------------------------------------------------------------------ */
    /* Validate admin authentication                                      */
    /* ------------------------------------------------------------------ */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the caller's profile to verify admin role
    const { data: callerProfile, error: callerError } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (callerError || !callerProfile || callerProfile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ------------------------------------------------------------------ */
    /* Parse request payload                                              */
    /* ------------------------------------------------------------------ */
    const { userId, action } = (await request.json()) as {
      userId?: string;
      action?: "approve" | "reject";
    };

    if (!userId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "userId and valid action ('approve' | 'reject') are required" },
        { status: 400 },
      );
    }

    console.log(`🔍 Admin ${user.id} attempting to ${action} professor ${userId}`);

    const newStatus = action === "approve" ? "approved" : "rejected";

    /* ------------------------------------------------------------------ */
    /* First check if professor exists                                    */
    /* ------------------------------------------------------------------ */
    const { data: existingProf } = await supabase
      .from("user_profiles")
      .select("id, user_type, account_status")
      .eq("id", userId);
    
    console.log(`🔍 Found professor check:`, existingProf);

    /* ------------------------------------------------------------------ */
    /* Update account_status using service role to bypass RLS            */
    /* ------------------------------------------------------------------ */
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: updatedProfiles, error: updateError } = await serviceSupabase
      .from("user_profiles")
      .update({ account_status: newStatus })
      .eq("id", userId)
      .eq("user_type", "professor")
      .select();

    if (updateError) {
      console.error("Error updating professor account status", updateError);
      return NextResponse.json(
        { error: "Failed to update account status" },
        { status: 500 },
      );
    }

    if (!updatedProfiles || updatedProfiles.length === 0) {
      console.error(`No professor found with id ${userId}`);
      return NextResponse.json(
        { error: "Professor not found" },
        { status: 404 },
      );
    }

    const updatedProfile = updatedProfiles[0];

    /* ------------------------------------------------------------------ */
    /* Send email notification                                            */
    /* ------------------------------------------------------------------ */
    try {
      await sendProfessorStatusEmail({
        professorEmail: updatedProfile.email,
        professorName: updatedProfile.full_name || "Professor",
        status: newStatus as "approved" | "rejected",
      });

      console.log(`✅ Email sent to professor ${updatedProfile.email} for status: ${newStatus}`);
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Don't fail the request if email fails, just log it
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Server error in update-professor-status", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 