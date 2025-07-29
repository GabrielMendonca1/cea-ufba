import { z } from 'zod';
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

// Common schemas
export const UUIDSchema = z.string().uuid();
export const EmailSchema = z.string().email();
export const NonEmptyStringSchema = z.string().min(1);

// User Profile schemas
export const UpdateProfileSchema = z.object({
  email: EmailSchema,
  updates: z.object({
    full_name: z.string().min(1).optional(),
    bio: z.string().optional(),
    university: z.string().optional(),
    course: z.string().optional(),
    semester: z.number().int().min(1).max(20).optional(),
    research_areas: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    cv_url: z.string().url().optional(),
    github_url: z.string().url().optional(),
    linkedin_url: z.string().url().optional(),
    lattes_url: z.string().url().optional(),
    orcid_url: z.string().url().optional(),
  }),
});

// Post schemas
export const CreatePostSchema = z.object({
  title: NonEmptyStringSchema,
  content: NonEmptyStringSchema,
  summary: z.string().optional(),
  published: z.boolean().default(false),
  featured_image_url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdatePostSchema = z.object({
  postId: UUIDSchema,
  updates: z.object({
    title: NonEmptyStringSchema.optional(),
    content: NonEmptyStringSchema.optional(),
    summary: z.string().optional(),
    published: z.boolean().optional(),
    featured_image_url: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const DeletePostSchema = z.object({
  postId: UUIDSchema,
});

// Research Opportunity schemas
export const CreateResearchOpportunitySchema = z.object({
  title: NonEmptyStringSchema,
  description: NonEmptyStringSchema,
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  duration: z.string().optional(),
  commitment: z.string().optional(),
  research_areas: z.array(z.string()).optional(),
  skills_required: z.array(z.string()).optional(),
  location: z.string().optional(),
  remote_allowed: z.boolean().default(false),
  stipend: z.number().optional(),
  max_applications: z.number().int().min(1).optional(),
  application_deadline: z.string().datetime().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export const UpdateResearchOpportunitySchema = z.object({
  opportunityId: UUIDSchema,
  updates: z.object({
    title: NonEmptyStringSchema.optional(),
    description: NonEmptyStringSchema.optional(),
    requirements: z.string().optional(),
    benefits: z.string().optional(),
    duration: z.string().optional(),
    commitment: z.string().optional(),
    research_areas: z.array(z.string()).optional(),
    skills_required: z.array(z.string()).optional(),
    location: z.string().optional(),
    remote_allowed: z.boolean().optional(),
    stipend: z.number().optional(),
    max_applications: z.number().int().min(1).optional(),
    application_deadline: z.string().datetime().optional(),
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const DeleteResearchOpportunitySchema = z.object({
  opportunityId: UUIDSchema,
});

// Application schemas
export const CreateApplicationSchema = z.object({
  research_opportunity_id: UUIDSchema,
  motivation: NonEmptyStringSchema,
  relevant_experience: z.string().optional(),
  availability: z.string().optional(),
  expected_outcomes: z.string().optional(),
  additional_comments: z.string().optional(),
});

export const UpdateApplicationStatusSchema = z.object({
  applicationId: UUIDSchema,
  status: z.enum(['pending', 'accepted', 'rejected', 'withdrawn']),
});

// Scientific Outreach schemas
export const CreateOutreachSchema = z.object({
  title: NonEmptyStringSchema,
  description: NonEmptyStringSchema,
  event_type: z.enum(['workshop', 'seminar', 'conference', 'exhibition', 'competition', 'other']),
  event_date: z.string().datetime().optional(),
  location: z.string().optional(),
  target_audience: z.string().optional(),
  registration_required: z.boolean().default(false),
  registration_url: z.string().url().optional(),
  contact_email: EmailSchema.optional(),
  max_participants: z.number().int().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateOutreachSchema = z.object({
  outreachId: UUIDSchema,
  updates: z.object({
    title: NonEmptyStringSchema.optional(),
    description: NonEmptyStringSchema.optional(),
    event_type: z.enum(['workshop', 'seminar', 'conference', 'exhibition', 'competition', 'other']).optional(),
    event_date: z.string().datetime().optional(),
    location: z.string().optional(),
    target_audience: z.string().optional(),
    registration_required: z.boolean().optional(),
    registration_url: z.string().url().optional(),
    contact_email: EmailSchema.optional(),
    max_participants: z.number().int().min(1).optional(),
    tags: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
  }),
});

export const DeleteOutreachSchema = z.object({
  outreachId: UUIDSchema,
});

// Generic validation helper
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        success: false, 
        error: `Validation error: ${firstError.path.join('.')} - ${firstError.message}` 
      };
    }
    return { success: false, error: 'Invalid input data' };
  }
}

// Enhanced middleware with Zod validation

export function withAuthAndValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (req: NextRequest & { user: User }, validatedData: T) => Promise<NextResponse>
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    try {
      // Authentication check (similar to withAuth)
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const validation = validateSchema(schema, body);
      
      if (!validation.success) {
        return NextResponse.json(
          { success: false, error: validation.error },
          { status: 400 }
        );
      }

      // Call handler with validated data
      const authenticatedRequest = request as NextRequest & { user: User };
      authenticatedRequest.user = user;
      
      return await handler(authenticatedRequest, validation.data);
    } catch (error) {
      console.error("API middleware error:", error);
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}