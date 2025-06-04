"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile, completeOnboarding, UserProfile } from "@/utils/supabase/user-profile";
import ProfileOnboarding from "@/components/onboarding/profile-onboarding";
import { useAuth } from "@/contexts/auth-context";

export default function OnboardingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        if (!user) {
          router.push('/sign-in');
          return;
        }

        const userProfile = await getCurrentUserProfile();
        
        if (!userProfile) {
          router.push('/sign-in');
          return;
        }

        // If already completed onboarding, redirect to dashboard
        if (userProfile.has_completed_onboarding) {
          router.push('/dashboard');
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error('Error checking profile:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [user, router]);

  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding();
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

  if (!profile) {
    return null;
  }

  return (
    <ProfileOnboarding
      userType={profile.user_type}
      userName={profile.full_name}
      currentProfile={profile}
      onComplete={handleOnboardingComplete}
    />
  );
} 