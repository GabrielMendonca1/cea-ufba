import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

export interface AuthenticatedRequest extends NextRequest {
  user: User;
}

export interface APIResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Generic API middleware that handles authentication and user injection
 * @param handler - The API route handler that receives the authenticated request
 * @returns NextResponse with proper error handling
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    try {
      const supabase = await createClient();
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Inject user into request object
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;

      // Call the actual handler
      return await handler(authenticatedRequest);
    } catch (error) {
      console.error("API middleware error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for public routes that don't require authentication
 * @param handler - The API route handler
 * @returns NextResponse with proper error handling
 */
export function withPublicAccess(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    try {
      return await handler(request);
    } catch (error) {
      console.error("Public API error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to create standardized API responses
 */
export function createAPIResponse(
  success: boolean,
  data?: any,
  error?: string,
  status: number = 200
): NextResponse {
  const response: APIResponse = { success };
  
  if (data) response.data = data;
  if (error) response.error = error;
  
  return NextResponse.json(response, { status });
}

/**
 * Helper function to validate request body against schema
 */
export function validateRequestBody(body: any, requiredFields: string[]): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}