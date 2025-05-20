// No "use client" here - this is a Server Component

import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import MainLayoutClientWrapper from "./main-layout-client-wrapper"; // Import the new wrapper
import "./globals.css"; // Global styles

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CEA UFBA",
  description: "CEA UFBA",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MainLayoutClientWrapper>
            {children}
          </MainLayoutClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
