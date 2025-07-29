import { NextRequest, NextResponse } from "next/server";
import { updateResearchOpportunity } from "@/lib/queries";
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
    const { opportunityId, updates } = body;

    if (!opportunityId || !updates) {
      return NextResponse.json(
        { error: "Opportunity ID and updates are required" },
        { status: 400 }
      );
    }

    // Verify user owns the research opportunity
    const { data: opportunity, error: fetchError } = await supabase
      .from('research_opportunities')
      .select('supervisor_id')
      .eq('id', opportunityId)
      .single();

    if (fetchError || !opportunity) {
      return NextResponse.json(
        { error: "Research opportunity not found" },
        { status: 404 }
      );
    }

    if (opportunity.supervisor_id !== user.id) {
      return NextResponse.json(
        { error: "Forbidden - You can only update your own research opportunities" },
        { status: 403 }
      );
    }

    const updatedOpportunity = await updateResearchOpportunity(opportunityId, updates);

    if (!updatedOpportunity) {
      return NextResponse.json(
        { error: "Failed to update research opportunity" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      opportunity: updatedOpportunity 
    });

  } catch (error) {
    console.error("Error in research update API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 