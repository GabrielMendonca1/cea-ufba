import { NextRequest, NextResponse } from "next/server";
import { updateUserProfile } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, updates } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
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