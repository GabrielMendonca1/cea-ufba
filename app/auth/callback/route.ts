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

  console.log('🔄 Auth callback started:', {
    code: code ? 'present' : 'missing',
    origin,
    redirectTo,
    fullUrl: request.url
  });

  if (code) {
    const supabase = await createClient();
    console.log('🔄 Exchanging code for session...');
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    if (data.user) {
      console.log('✅ User authenticated successfully:', {
        userId: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at,
        confirmedAt: new Date(data.user.email_confirmed_at || '').toISOString()
      });

      // Check if user has a profile, if not redirect to onboarding
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('has_completed_onboarding')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking user profile:', profileError);
        }

        if (!profile || !profile.has_completed_onboarding) {
          console.log('🔄 Redirecting to onboarding');
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      } catch (profileError) {
        console.error('Unexpected error checking user profile:', profileError);
      }
    }

    // Profile creation is now handled automatically by the database trigger
    // No need for manual profile creation here
  } else {
    console.log('⚠️ No code provided in callback');
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('No authentication code provided')}`);
  }

  if (redirectTo) {
    console.log('🔄 Redirecting to specified path:', redirectTo);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  console.log('🔄 Redirecting to dashboard');
  return NextResponse.redirect(`${origin}/dashboard`);
}
