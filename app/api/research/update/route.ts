import { NextRequest, NextResponse } from "next/server";
import { updateResearchOpportunity } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunityId, updates } = body;

    if (!opportunityId || !updates) {
      return NextResponse.json(
        { error: "Opportunity ID and updates are required" },
        { status: 400 }
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