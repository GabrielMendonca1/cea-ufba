"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from "@/utils/supabase/client";
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  full_name: string | null;
  user_type: 'student' | 'professor' | 'admin';
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Create a single client instance to prevent session loss
  const supabase = createClient();

  const refreshUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error refreshing user:', error);
        setUser(null);
        setUserProfile(null);
      } else {
        setUser(user);
        
        // Fetch user profile if user exists
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, full_name, user_type, avatar_url')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('Error in refreshUser:', error);
      setUser(null);
      setUserProfile(null);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('SignOut error:', error);
      }
      
      setUser(null);
      setUserProfile(null);
      router.push('/sign-in');
      router.refresh();
    } catch (error) {
      console.error('Unexpected error in signOut:', error);
      setUser(null);
      setUserProfile(null);
      router.push('/sign-in');
    }
  };

  useEffect(() => {

    // Get initial user state
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting initial user:', error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error in getInitialUser:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, !!session?.user);
        
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
          // Refresh user profile when signed in
          refreshUser();
          // Force a page refresh to update server-side state
          router.refresh();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserProfile(null);
          router.push('/sign-in');
          router.refresh();
        } else if (event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 