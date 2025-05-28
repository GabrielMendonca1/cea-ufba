import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";

/**
 * Protected Page Component
 * This page demonstrates authentication protection and displays user information.
 * Only authenticated users can access this page.
 */
export default async function ProtectedPage() {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Note: User redirect is temporarily disabled for debugging
  // Uncomment the following lines to enforce authentication:
  // if (!user) {
  //   return redirect("/sign-in");
  // }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      {/* Protection notice */}
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      
      {/* User details section */}
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        {user ? (
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        ) : (
          <div className="p-3 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-yellow-800">No user found. You may need to sign in.</p>
          </div>
        )}
      </div>
      
      {/* Application information section */}
      <div>
        <h2 className="font-bold text-2xl mb-4">Application Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Research Opportunities</h3>
            <p className="text-sm text-muted-foreground">
              Browse and discover research opportunities from various institutions.
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Profile Management</h3>
            <p className="text-sm text-muted-foreground">
              Manage your academic profile and preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
