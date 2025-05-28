// No "use client" here - this is a Server Component

import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MainLayoutClientWrapper from "./main-layout-client-wrapper"; // Import the new wrapper
import "./globals.css"; // Global styles

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
});

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Research Opportunities Platform",
  description: "Discover and connect with research opportunities",
};

/**
 * Root Layout Component
 * 
 * This is the root layout that wraps all pages in the application.
 * It provides:
 * - Global styling and font setup
 * - Theme provider for dark/light mode
 * - Main layout wrapper with authentication context
 * - Responsive layout structure
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        {/* Theme provider enables dark/light mode switching */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Main layout wrapper handles authentication, navigation, and footer */}
          <MainLayoutClientWrapper>
            {children}
          </MainLayoutClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
