"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardRefresher() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only refresh if we're on dashboard or protected pages and user state changed
    const isProtectedPage = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/onboarding') ||
                           pathname.startsWith('/protected');

    if (isProtectedPage && user) {
      // Small delay to allow auth context to stabilize
      const timer = setTimeout(() => {
        router.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, router, pathname]);

  return null; // This component doesn't render anything
} 