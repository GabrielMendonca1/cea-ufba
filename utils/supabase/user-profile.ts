import { createClient } from './client';

export type UserType = 'student' | 'teacher';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  user_type: UserType;
  department?: string;
  course?: string; // for students
  research_area?: string; // for teachers
  bio?: string;
  lattes_url?: string; // for teachers
  student_id?: string; // for students
  phone?: string;
  avatar_url?: string;
  is_profile_complete: boolean;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  user_type: UserType;
  full_name?: string;
  department?: string;
  course?: string;
  research_area?: string;
  bio?: string;
  lattes_url?: string;
  student_id?: string;
  phone?: string;
}

export interface UpdateUserProfileData extends Partial<CreateUserProfileData> {
  is_profile_complete?: boolean;
  has_completed_onboarding?: boolean;
  avatar_url?: string;
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Create or update user profile
export async function upsertUserProfile(profileData: CreateUserProfileData): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      email: user.email!,
      ...profileData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }

  return data;
}

// Update user profile
export async function updateUserProfile(profileData: UpdateUserProfileData): Promise<UserProfile | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

// Mark onboarding as completed
export async function completeOnboarding(): Promise<boolean> {
  try {
    await updateUserProfile({ 
      has_completed_onboarding: true 
    });
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return false;
  }
}

// Check if user needs onboarding
export async function needsOnboarding(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return !profile?.has_completed_onboarding;
}

// Get user profile by ID (for viewing other users)
export async function getUserProfileById(id: string): Promise<UserProfile | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching user profile by ID:', error);
    return null;
  }

  return data;
}

// Get profiles by user type (for browsing)
export async function getProfilesByType(userType: UserType, limit = 20, offset = 0): Promise<UserProfile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_type', userType)
    .eq('is_profile_complete', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching profiles by type:', error);
    return [];
  }

  return data || [];
}

// Search profiles
export async function searchProfiles(
  query: string, 
  userType?: UserType, 
  department?: string
): Promise<UserProfile[]> {
  const supabase = createClient();

  let queryBuilder = supabase
    .from('user_profiles')
    .select('*')
    .eq('is_profile_complete', true);

  if (userType) {
    queryBuilder = queryBuilder.eq('user_type', userType);
  }

  if (department) {
    queryBuilder = queryBuilder.eq('department', department);
  }

  // Search in multiple fields
  queryBuilder = queryBuilder.or(
    `full_name.ilike.%${query}%,research_area.ilike.%${query}%,department.ilike.%${query}%,bio.ilike.%${query}%`
  );

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching profiles:', error);
    return [];
  }

  return data || [];
}

// Validate if email belongs to a teacher (simple validation based on name patterns)
export function validateTeacherByName(name: string): boolean {
  const teacherTitles = [
    'prof', 'professor', 'professora', 'dr', 'dra', 'doutor', 'doutora',
    'msc', 'mestre', 'ms', 'phd', 'ph.d'
  ];
  
  const normalizedName = name.toLowerCase();
  return teacherTitles.some(title => normalizedName.includes(title));
}

// Get departments list
export async function getDepartments(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('department')
    .not('department', 'is', null);

  if (error) {
    console.error('Error fetching departments:', error);
    return [];
  }

  // Get unique departments
  const departments = Array.from(new Set(data.map(item => item.department).filter(Boolean)));
  return departments;
}

// Get research areas list
export async function getResearchAreas(): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('research_area')
    .not('research_area', 'is', null);

  if (error) {
    console.error('Error fetching research areas:', error);
    return [];
  }

  // Get unique research areas
  const areas = Array.from(new Set(data.map(item => item.research_area).filter(Boolean)));
  return areas;
} 