import { NextRequest, NextResponse } from "next/server";
import { createResearchOpportunity } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId || !data) {
      return NextResponse.json(
        { error: "User ID and data are required" },
        { status: 400 }
      );
    }

    const newOpportunity = await createResearchOpportunity(userId, data);

    if (!newOpportunity) {
      return NextResponse.json(
        { error: "Failed to create research opportunity" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      opportunity: newOpportunity 
    });

  } catch (error) {
    console.error("Error in research create API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 