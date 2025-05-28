"use client";

/**
 * Main Layout Client Wrapper Component
 * 
 * This is the main client-side wrapper that provides the core layout structure
 * for all pages in the application. It handles:
 * 
 * Core functionality:
 * - Role-based view switching (student/teacher)
 * - Authentication state management
 * - Error boundary for error handling
 * - Fixed header with navigation
 * - Responsive layout structure
 * - Footer component
 * 
 * Component hierarchy:
 * - ErrorBoundary -> RoleProvider -> AuthWrapper -> Layout Structure
 */

import React from 'react';
import Link from "next/link";
import { RoleProvider, useRole } from "@/contexts/role-context";
import { Button } from "@/components/ui/button";
import HeaderAuthClient from "@/components/header-auth-client";
import Footer from "@/components/footer";
import AuthWrapper from "@/components/auth-wrapper";
import ErrorBoundary from "@/components/error-boundary";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

/**
 * Header Content Component
 * 
 * Client component that renders the fixed header navigation.
 * Includes role switching, authentication controls, and main navigation.
 */
function HeaderContent() {
  const { role, toggleRole } = useRole();
  
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 left-0 right-0 bg-background z-50">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        {/* Brand/Logo section */}
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>CEA UFBA</Link>
        </div>
        
        {/* Navigation controls */}
        <div className="flex items-center gap-4">
          {/* Role switcher for different user views */}
          <Button onClick={toggleRole} variant="outline" size="sm">
            Switch to {role === 'student' ? 'Teacher' : 'Student'} View
          </Button>

          {/* Authentication controls */}
          <HeaderAuthClient />
          
          {/* Dashboard link with user icon */}
          <Link href="/dashboard" title="Dashboard" className="text-foreground hover:text-foreground/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/**
 * Main Layout Client Wrapper
 * 
 * Provides the complete layout structure with context providers,
 * error handling, and responsive design.
 * 
 * @param children - Page content to be rendered within the layout
 */
export default function MainLayoutClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <RoleProvider>
        <AuthWrapper>
          <div className="min-h-screen flex flex-col items-center">
            {/* Fixed header navigation */}
            <HeaderContent />
            
            {/* Main content area with top padding for fixed header */}
            <div className="flex-1 w-full flex flex-col items-center pt-16">
              <div className="flex flex-col gap-20 max-w-5xl p-5 w-full">
                {children}
              </div>
            </div>
            
            {/* Footer component */}
            <Footer />
          </div>
        </AuthWrapper>
      </RoleProvider>
    </ErrorBoundary>
  );
} 