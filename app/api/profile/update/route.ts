import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";

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
    const { email, updates } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Verify user can only update their own profile
    if (user.email !== email) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own profile" },
        { status: 403 }
      );
    }

    const updatedProfile = await updateUserProfile(email, updates);

    if (!updatedProfile) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    });

  } catch (error) {
    console.error("Error in profile update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 