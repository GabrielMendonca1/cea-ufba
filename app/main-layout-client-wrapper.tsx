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

import React from "react";
import Link from "next/link";
import { RoleProvider } from "@/contexts/role-context";
import { AuthProvider } from "@/contexts/auth-context";
import HeaderAuthClient from "@/components/auth/header-auth-client";
import Footer from "@/components/layout/footer";
import AuthWrapper from "@/components/auth/auth-wrapper";
import ErrorBoundary from "@/components/layout/error-boundary";
import LoginNotification from "@/components/ui/login-notification";
import DashboardRefresher from "@/components/auth/dashboard-refresher";
import { Input } from "@/components/ui/input";
import { usePathname } from 'next/navigation';

/**
 * Header Content Component
 *
 * Client component that renders the fixed header navigation.
 * Includes role switching, authentication controls, and main navigation.
 */
function HeaderContent() {
  return (
    <>
      {/* Main fixed header */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 fixed top-0 left-0 right-0 bg-background z-50">
        <div className="w-full max-w-5xl flex items-center justify-between p-3 px-5 text-sm">
          {/* Brand */}
          <div className="font-semibold">
            <Link href="/">CEA UFBA</Link>
          </div>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <Input placeholder="Buscar..." className="max-w-xs rounded-full" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <HeaderAuthClient />
          </div>
        </div>
      </nav>

      {/* Sub header with navigation links */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-12 fixed top-16 left-0 right-0 bg-background z-40">
        <div className="w-full max-w-5xl flex justify-center gap-5 items-center font-semibold text-sm">
          <Link href="/">Divulgação</Link>
          <Link href="/pesquisas">Pesquisas</Link>
          <Link href="/docentes">Docentes</Link>
        </div>
      </nav>
    </>
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
export default function MainLayoutClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCreatePostPage = pathname === '/dashboard/posts/create';

  // If it's the create post page, render only the children for a full-screen experience.
  if (isCreatePostPage) {
    return <>{children}</>;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RoleProvider>
          <AuthWrapper>
            <div className="min-h-screen flex flex-col items-center">
              {/* Fixed header navigation */}
              <HeaderContent />

              {/* Login/logout notification */}
              <LoginNotification />

              {/* Dashboard auto-refresher */}
              <DashboardRefresher />

              {/* Main content area with top padding for fixed headers */}
              <div className="flex-1 w-full flex flex-col items-center pt-28">
                <div className="flex flex-col gap-20 max-w-5xl p-5 w-full">
                  {children}
                </div>
              </div>

              {/* Footer component */}
              <Footer />
            </div>
          </AuthWrapper>
        </RoleProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
