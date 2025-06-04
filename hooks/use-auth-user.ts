"use client";

import { useAuth } from "@/contexts/auth-context";

export interface AuthState {
  user: any | null;
  loading: boolean;
}

export default function useAuthUser(): AuthState {
  const { user, loading } = useAuth();
  return { user, loading };
}
