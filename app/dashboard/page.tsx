import { createClient } from "@/utils/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoIcon, User, Mail, Calendar, Shield, Phone, BookOpen, Users, FileText, GraduationCap, Building, MapPin } from "lucide-react";
import { getDashboardData, getDebugData } from "@/lib/queries";
import { EditProfileForm } from "@/components/forms/EditProfileForm";
import { ResearchOpportunityManager } from "@/components/research/ResearchOpportunityManager";

/**
 * Dashboard Page Component
 * This page displays user-specific dashboard content based on their role.
 * Only authenticated users can access this page.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔍 [DEBUG] User data:", user);

  // Note: User redirect is temporarily disabled for debugging
  // Uncomment the following lines to enforce authentication:
  // if (!user) {
  //   return redirect("/sign-in");
  // }

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4 flex-1">
        <div className="p-6 bg-yellow-100 border border-yellow-400 rounded-lg">
          <p className="text-yellow-800 font-medium">No user found. You may need to sign in.</p>
        </div>
      </div>
    );
  }

  // Extract user information
  const userEmail = user.email || 'Not provided';
  const userId = user.id;
  const emailConfirmed = user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleDateString() : 'Not confirmed';
  const userPhone = user.phone || 'Not provided';
  const userRole = user.role || 'authenticated';
  
  // Get the actual user type from user metadata or user object
  const userType = (user.user_metadata?.user_type || user.app_metadata?.user_type || 'student') as string;
  const role = userType; // Use the actual user type instead of hardcoded value

  console.log("🔍 [DEBUG] Extracted user info:", {
    userEmail,
    userId,
    userType,
    role
  });

  // Get all dashboard data using our query functions with Promise.all() optimization
  const [dashboardData, debugData] = await Promise.all([
    getDashboardData(user),
    getDebugData()
  ]);

  const { userProfile, researchOpportunities, applications, stats } = dashboardData;

  return (
    <div className="container mx-auto py-6 px-4 flex-1">
      <div className="flex flex-col space-y-6">
        {/* Protection notice */}
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            This is a protected page that you can only see as an authenticated user
          </div>
        </div>

        {/* Debug Info at Top */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Debug Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Email:</strong> {userEmail}<br/>
              <strong>User ID:</strong> {userId}<br/>
              <strong>User Type:</strong> {userType}<br/>
              <strong>Role:</strong> {role}
            </div>
            <div>
              <strong>Profile Found:</strong> {userProfile ? 'Yes' : 'No'}<br/>
              <strong>Research Count:</strong> {stats.totalResearch}<br/>
              <strong>Applications Count:</strong> {stats.totalApplications}<br/>
              <strong>Pending Applications:</strong> {stats.pendingApplications}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard ({role === 'student' ? 'Aluno' : role === 'professor' ? 'Professor' : 'Usuario'})
          </h1>
        </div>
        
        {/* User Profile Section with Edit Button */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-2xl">Profile Information</h2>
            <EditProfileForm userProfile={userProfile} userEmail={userEmail} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Email Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{userEmail}</div>
                <p className="text-xs text-muted-foreground">
                  Confirmed: {emailConfirmed}
                </p>
              </CardContent>
            </Card>

            {/* Full Name Card (from profile) */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{userProfile?.full_name || 'Not provided'}</div>
                <p className="text-xs text-muted-foreground">
                  Display name
                </p>
              </CardContent>
            </Card>

            {/* User Type Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  User Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold capitalize">{userProfile?.user_type || userType}</div>
                <p className="text-xs text-muted-foreground">
                  Account type
                </p>
              </CardContent>
            </Card>

            {/* Department Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{userProfile?.department || 'Not specified'}</div>
                <p className="text-xs text-muted-foreground">
                  Academic department
                </p>
              </CardContent>
            </Card>

            {/* Research Area Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Research Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{userProfile?.research_area || 'Not specified'}</div>
                <p className="text-xs text-muted-foreground">
                  Field of study
                </p>
              </CardContent>
            </Card>

            {/* Bio Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Bio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{userProfile?.bio || 'No bio provided'}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Personal information
                </p>
              </CardContent>
            </Card>

            {/* Student ID Card (for students) */}
            {userProfile?.user_type === 'student' && (
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Student ID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">{userProfile?.student_id || 'Not provided'}</div>
                  <p className="text-xs text-muted-foreground">
                    University registration
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Lattes URL Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Lattes CV
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProfile?.lattes_url ? (
                  <a 
                    href={userProfile.lattes_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View CV
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">Not provided</span>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Academic CV
                </p>
              </CardContent>
            </Card>

            {/* Profile Completion Card */}
            <Card>
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Profile Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-bold ${userProfile?.is_profile_complete ? 'text-green-600' : 'text-orange-600'}`}>
                  {userProfile?.is_profile_complete ? 'Complete' : 'Incomplete'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Profile completion status
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Role-specific content */}
        {role === 'professor' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Professor Dashboard</h2>
            
            {/* Research Opportunities Summary */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Research Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalResearch}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Active research projects you're supervising
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Applications Received
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Student applications to review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Pending Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Applications awaiting your decision
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Research Opportunity Management */}
            <ResearchOpportunityManager 
              researchOpportunities={researchOpportunities} 
              userId={userId} 
            />

            {/* Recent Applications */}
            {applications && applications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Recent Applications</h3>
                <div className="grid gap-4">
                  {applications.slice(0, 5).map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {application.research_opportunities?.title}
                        </CardTitle>
                        <CardDescription>
                          Application from {application.user_profiles?.full_name || application.user_profiles?.email}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status?.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Student Dashboard</h2>
            
            {/* Student Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">My Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Research applications submitted
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Awaiting professor review
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approved Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.approvedApplications}</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Successful applications
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Student Applications */}
            {applications && applications.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">My Applications</h3>
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {application.research_opportunities?.title}
                        </CardTitle>
                        <CardDescription>
                          {application.research_opportunities?.department}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status?.toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Applied: {new Date(application.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Debug Section */}
        <div>
          <h2 className="font-bold text-2xl mb-4">Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Profile Data</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show profile data
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(userProfile, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Research Data</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show research data
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(researchOpportunities, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Applications Data</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show applications data
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(applications, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>

          {/* Debug data from tables */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All Profiles (Sample)</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show all profiles sample
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(debugData.profiles, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All Research (Sample)</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show all research sample
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(debugData.research, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">All Applications (Sample)</CardTitle>
              </CardHeader>
              <CardContent>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">
                    Show all applications sample
                  </summary>
                  <pre className="mt-2 text-xs font-mono p-2 bg-gray-100 dark:bg-gray-800 rounded max-h-32 overflow-auto">
                    {JSON.stringify(debugData.applications, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 