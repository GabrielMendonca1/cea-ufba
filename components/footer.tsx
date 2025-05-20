import Link from 'next/link';
import { ThemeSwitcher } from './theme-switcher'; // Assuming ThemeSwitcher is in the same directory or adjust path

export default function Footer() {
  return (
    <footer className="w-full border-t border-t-foreground/10 bg-background">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p>
            &copy; {new Date().getFullYear()} CEA UFBA. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/terms" className="hover:text-gray-700 dark:hover:text-gray-200">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">
              Privacy Policy
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
        <p className="mt-8">
          Powered by{' '}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-semibold text-gray-700 dark:text-gray-200 hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
          {' & '}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-semibold text-gray-700 dark:text-gray-200 hover:underline"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
      </div>
    </footer>
  );
} 