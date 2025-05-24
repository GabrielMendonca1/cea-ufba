"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthWrapper: useEffect started');
    const supabase = createClient();

    const getInitialState = async () => {
      console.log('AuthWrapper: getInitialState started');
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log('AuthWrapper: getUser result:', { user: !!user, error });
        setUser(user);
      } catch (error) {
        console.error('AuthWrapper: Error getting initial state:', error);
      } finally {
        console.log('AuthWrapper: Setting loading to false');
        setLoading(false);
      }
    };

    getInitialState();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthWrapper: Auth state changed:', event, !!session?.user);
        setUser(session?.user || null);
      }
    );

    return () => {
      console.log('AuthWrapper: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  console.log('AuthWrapper: Rendering - loading:', loading, 'user:', !!user);

  if (loading) {
    console.log('AuthWrapper: Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  console.log('AuthWrapper: Rendering children');
  return <>{children}</>;
} 