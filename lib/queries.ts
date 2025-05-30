import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

// Types for our database entities
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  user_type: 'student' | 'professor';
  department: string | null;
  research_area: string | null;
  bio: string | null;
  lattes_url: string | null;
  student_id: string | null;
  avatar_url: string | null;
  is_profile_complete: boolean;
  has_completed_onboarding: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ResearchOpportunity {
  id: string;
  title: string;
  description: string;
  supervisor_id: string;
  department: string;
  faculty: string;
  research_area: string;
  scholarship_type: string;
  duration: string;
  monthly_value: string;
  requirements: string | null;
  start_date: string;
  deadline: string;
  vacancies: number;
  workload: string;
  objectives: string | null;
  methodology: string | null;
  expected_results: string | null;
  contact_email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  research_opportunity_id: string;
  status: 'pending' | 'approved' | 'rejected';
  cover_letter: string;
  created_at: string;
  updated_at: string;
  research_opportunities?: ResearchOpportunity;
  user_profiles?: UserProfile;
}

export interface DashboardData {
  userProfile: UserProfile | null;
  researchOpportunities: ResearchOpportunity[] | null;
  applications: Application[] | null;
  stats: {
    totalResearch: number;
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
  };
}

// Update user profile data
export interface UpdateUserProfileData {
  full_name?: string;
  department?: string;
  research_area?: string;
  bio?: string;
  lattes_url?: string;
  student_id?: string;
}

// Create research opportunity data
export interface CreateResearchOpportunityData {
  title: string;
  description: string;
  department: string;
  faculty: string;
  research_area: string;
  scholarship_type: string;
  duration: string;
  monthly_value: string;
  requirements?: string;
  start_date: string;
  deadline: string;
  vacancies: number;
  workload: string;
  objectives?: string;
  methodology?: string;
  expected_results?: string;
  contact_email: string;
}

/**
 * Get user profile by email
 */
export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching user profile for:", email);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error("❌ [QUERIES] Error fetching user profile:", error);
    return null;
  }

  console.log("✅ [QUERIES] User profile fetched successfully");
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(email: string, updates: UpdateUserProfileData): Promise<UserProfile | null> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Updating user profile for:", email, updates);
  
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select()
    .single();

  if (error) {
    console.error("❌ [QUERIES] Error updating user profile:", error);
    return null;
  }

  console.log("✅ [QUERIES] User profile updated successfully");
  return data;
}

/**
 * Get research opportunities for a professor
 */
export async function getProfessorResearchOpportunities(supervisorId: string): Promise<ResearchOpportunity[]> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching research opportunities for supervisor:", supervisorId);
  
  const { data, error } = await supabase
    .from('research_opportunities')
    .select('*')
    .eq('supervisor_id', supervisorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [QUERIES] Error fetching research opportunities:", error);
    return [];
  }

  console.log("✅ [QUERIES] Research opportunities fetched:", data?.length || 0);
  return data || [];
}

/**
 * Create new research opportunity
 */
export async function createResearchOpportunity(supervisorId: string, data: CreateResearchOpportunityData): Promise<ResearchOpportunity | null> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Creating research opportunity for supervisor:", supervisorId);
  
  const { data: newOpportunity, error } = await supabase
    .from('research_opportunities')
    .insert({
      ...data,
      supervisor_id: supervisorId,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ [QUERIES] Error creating research opportunity:", error);
    return null;
  }

  console.log("✅ [QUERIES] Research opportunity created successfully");
  return newOpportunity;
}

/**
 * Update research opportunity
 */
export async function updateResearchOpportunity(opportunityId: string, updates: Partial<CreateResearchOpportunityData>): Promise<ResearchOpportunity | null> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Updating research opportunity:", opportunityId);
  
  const { data, error } = await supabase
    .from('research_opportunities')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', opportunityId)
    .select()
    .single();

  if (error) {
    console.error("❌ [QUERIES] Error updating research opportunity:", error);
    return null;
  }

  console.log("✅ [QUERIES] Research opportunity updated successfully");
  return data;
}

/**
 * Get applications for professor's research opportunities
 */
export async function getProfessorApplications(opportunityIds: string[]): Promise<Application[]> {
  if (opportunityIds.length === 0) {
    return [];
  }

  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching applications for opportunities:", opportunityIds);
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      research_opportunities!inner(title, department, faculty),
      user_profiles(full_name, email)
    `)
    .in('research_opportunity_id', opportunityIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [QUERIES] Error fetching professor applications:", error);
    return [];
  }

  console.log("✅ [QUERIES] Professor applications fetched:", data?.length || 0);
  return data || [];
}

/**
 * Get applications for a student
 */
export async function getStudentApplications(studentId: string): Promise<Application[]> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching applications for student:", studentId);
  
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      research_opportunities(title, supervisor_id, department, faculty)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [QUERIES] Error fetching student applications:", error);
    return [];
  }

  console.log("✅ [QUERIES] Student applications fetched:", data?.length || 0);
  return data || [];
}

/**
 * Get all active research opportunities (for browsing)
 */
export async function getAllActiveResearchOpportunities(): Promise<ResearchOpportunity[]> {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching all active research opportunities");
  
  const { data, error } = await supabase
    .from('research_opportunities')
    .select('*')
    .eq('is_active', true)
    .gt('deadline', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ [QUERIES] Error fetching active research opportunities:", error);
    return [];
  }

  console.log("✅ [QUERIES] Active research opportunities fetched:", data?.length || 0);
  return data || [];
}

/**
 * Get complete dashboard data for a user using Promise.all() for parallel execution
 */
export async function getDashboardData(user: User): Promise<DashboardData> {
  const userEmail = user.email || '';
  const userId = user.id;
  const userType = (user.user_metadata?.user_type || user.app_metadata?.user_type || 'student') as 'student' | 'professor';

  console.log("🔍 [QUERIES] Getting dashboard data for:", { userEmail, userId, userType });

  if (userType === 'professor') {
    // For professors: get profile, research opportunities, and applications in parallel
    const [userProfile, researchOpportunities] = await Promise.all([
      getUserProfile(userEmail),
      getProfessorResearchOpportunities(userId)
    ]);

    // Get applications for the research opportunities (if any)
    let applications: Application[] = [];
    if (researchOpportunities.length > 0) {
      const opportunityIds = researchOpportunities.map(opp => opp.id);
      applications = await getProfessorApplications(opportunityIds);
    }

    // Calculate stats
    const stats = {
      totalResearch: researchOpportunities.length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
    };

    console.log("✅ [QUERIES] Professor dashboard data compiled:", stats);

    return {
      userProfile,
      researchOpportunities,
      applications,
      stats
    };
  } else {
    // For students: get profile and applications in parallel
    const [userProfile, applications] = await Promise.all([
      getUserProfile(userEmail),
      getStudentApplications(userId)
    ]);

    // Calculate stats
    const stats = {
      totalResearch: 0,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
    };

    console.log("✅ [QUERIES] Student dashboard data compiled:", stats);

    return {
      userProfile,
      researchOpportunities: null,
      applications,
      stats
    };
  }
}

/**
 * Debug function to get sample data from all tables using Promise.all()
 */
export async function getDebugData() {
  const supabase = await createClient();
  
  console.log("🔍 [QUERIES] Fetching debug data...");

  const [profilesResult, researchResult, applicationsResult] = await Promise.all([
    supabase.from('user_profiles').select('*').limit(5),
    supabase.from('research_opportunities').select('*').limit(5),
    supabase.from('applications').select('*').limit(5)
  ]);

  return {
    profiles: profilesResult.data || [],
    research: researchResult.data || [],
    applications: applicationsResult.data || [],
    errors: {
      profiles: profilesResult.error?.message,
      research: researchResult.error?.message,
      applications: applicationsResult.error?.message,
    }
  };
} 