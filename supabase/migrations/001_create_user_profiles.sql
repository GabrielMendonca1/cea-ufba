-- Create enum for user types
CREATE TYPE user_type AS ENUM ('student', 'teacher');

-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  user_type user_type not null,
  department text,
  course text, -- for students
  research_area text, -- for teachers
  bio text,
  lattes_url text, -- for teachers
  student_id text, -- for students
  phone text,
  avatar_url text,
  is_profile_complete boolean default false,
  has_completed_onboarding boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles (for discovery/networking)
CREATE POLICY "Public profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, user_type)
  VALUES (
    new.id,
    new.email,
    'student'::user_type -- default to student, will be updated during onboarding
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);
CREATE INDEX idx_user_profiles_department ON public.user_profiles(department);
CREATE INDEX idx_user_profiles_research_area ON public.user_profiles(research_area);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- Create research_opportunities table
CREATE TABLE public.research_opportunities (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  supervisor_id uuid references public.user_profiles(id) on delete cascade not null,
  department text not null,
  faculty text not null,
  research_area text not null,
  scholarship_type text not null,
  duration text not null,
  monthly_value text not null,
  requirements text[] not null,
  start_date date not null,
  deadline date not null,
  vacancies integer not null default 1,
  workload text not null,
  objectives text[] not null,
  methodology text not null,
  expected_results text[] not null,
  contact_email text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies for research_opportunities
ALTER TABLE public.research_opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone can view active research opportunities
CREATE POLICY "Active research opportunities are viewable by everyone" ON public.research_opportunities
  FOR SELECT USING (is_active = true);

-- Only teachers can insert research opportunities
CREATE POLICY "Teachers can insert research opportunities" ON public.research_opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'teacher'
    )
  );

-- Teachers can update their own research opportunities
CREATE POLICY "Teachers can update their own research opportunities" ON public.research_opportunities
  FOR UPDATE USING (
    supervisor_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'teacher'
    )
  );

-- Teachers can delete their own research opportunities
CREATE POLICY "Teachers can delete their own research opportunities" ON public.research_opportunities
  FOR DELETE USING (
    supervisor_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'teacher'
    )
  );

-- Create trigger to update updated_at for research_opportunities
CREATE TRIGGER update_research_opportunities_updated_at
  BEFORE UPDATE ON public.research_opportunities
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for research_opportunities
CREATE INDEX idx_research_opportunities_supervisor ON public.research_opportunities(supervisor_id);
CREATE INDEX idx_research_opportunities_department ON public.research_opportunities(department);
CREATE INDEX idx_research_opportunities_research_area ON public.research_opportunities(research_area);
CREATE INDEX idx_research_opportunities_deadline ON public.research_opportunities(deadline);
CREATE INDEX idx_research_opportunities_is_active ON public.research_opportunities(is_active);

-- Create applications table
CREATE TABLE public.applications (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.user_profiles(id) on delete cascade not null,
  research_opportunity_id uuid references public.research_opportunities(id) on delete cascade not null,
  cover_letter text,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(student_id, research_opportunity_id)
);

-- Create RLS policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Students can view their own applications
CREATE POLICY "Students can view their own applications" ON public.applications
  FOR SELECT USING (student_id = auth.uid());

-- Teachers can view applications for their research opportunities
CREATE POLICY "Teachers can view applications for their opportunities" ON public.applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.research_opportunities 
      WHERE id = research_opportunity_id AND supervisor_id = auth.uid()
    )
  );

-- Students can insert their own applications
CREATE POLICY "Students can insert their own applications" ON public.applications
  FOR INSERT WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE id = auth.uid() AND user_type = 'student'
    )
  );

-- Students can update their own applications (e.g., withdraw)
CREATE POLICY "Students can update their own applications" ON public.applications
  FOR UPDATE USING (student_id = auth.uid());

-- Teachers can update applications for their research opportunities
CREATE POLICY "Teachers can update applications for their opportunities" ON public.applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.research_opportunities 
      WHERE id = research_opportunity_id AND supervisor_id = auth.uid()
    )
  );

-- Create trigger to update updated_at for applications
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Create indexes for applications
CREATE INDEX idx_applications_student ON public.applications(student_id);
CREATE INDEX idx_applications_opportunity ON public.applications(research_opportunity_id);
CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created_at ON public.applications(created_at); 