import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const researchId = searchParams.get('researchId');

  if (!researchId) {
    return NextResponse.json(
      { error: "Research ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Get all applications for this research opportunity
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        user_profiles (
          id,
          full_name,
          email,
          student_id,
          course,
          avatar_url,
          bio
        )
      `)
      .eq('research_opportunity_id', researchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 