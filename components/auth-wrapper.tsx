"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getCurrentUserProfile, completeOnboarding, UserProfile } from "@/utils/supabase/user-profile";
import Onboarding from "./onboarding";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const getInitialState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const userProfile = await getCurrentUserProfile();
          setProfile(userProfile);
          
          // Show onboarding if user exists but hasn't completed onboarding
          if (userProfile && !userProfile.has_completed_onboarding) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error('Error getting initial state:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const userProfile = await getCurrentUserProfile();
          setProfile(userProfile);
          
          if (userProfile && !userProfile.has_completed_onboarding) {
            setShowOnboarding(true);
          }
        } else {
          setProfile(null);
          setShowOnboarding(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding();
      setShowOnboarding(false);
      
      // Refresh profile
      const updatedProfile = await getCurrentUserProfile();
      setProfile(updatedProfile);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show onboarding if user is authenticated and needs onboarding
  if (user && profile && showOnboarding) {
    return (
      <Onboarding
        userType={profile.user_type}
        userName={profile.full_name}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <>{children}</>;
} 