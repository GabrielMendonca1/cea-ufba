import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    // If user just signed up, create/update their profile
    if (data.user) {
      try {
        const userMetadata = data.user.user_metadata;
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Create new profile with metadata
          await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              user_type: userMetadata.user_type || 'student',
              full_name: userMetadata.full_name || '',
              has_completed_onboarding: false,
              is_profile_complete: false
            });
        } else {
          // Update existing profile if metadata exists
          if (userMetadata.user_type || userMetadata.full_name) {
            await supabase
              .from('user_profiles')
              .update({
                user_type: userMetadata.user_type || 'student',
                full_name: userMetadata.full_name || '',
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id);
          }
        }
      } catch (profileError) {
        console.error('Error creating/updating profile:', profileError);
        // Continue with redirect even if profile creation fails
      }
    }
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
