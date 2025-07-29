#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

try {
  const envContent = readFileSync(join(projectRoot, '.env.local'), 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
  console.log('✅ Loaded environment variables from .env.local');
} catch (error) {
  console.log('⚠️  Could not load .env.local file:', error.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const testProfessor = {
  email: 'professor.teste@cea.ufba.br',
  password: 'TestProf#123',
  full_name: 'Professor de Teste',
  department: 'Ciência da Computação',
  research_area: 'Inteligência Artificial'
};

async function main() {
  // Check if professor already exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', testProfessor.email)
    .single();

  if (existing) {
    console.log(`ℹ️  Professor ${testProfessor.email} already exists, skipping.`);
    process.exit(0);
  }

  // Create auth user via Admin API
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testProfessor.email,
    password: testProfessor.password,
    email_confirm: true
  });

  if (authError) {
    console.error(`❌ Failed to create auth user ${testProfessor.email}:`, authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;

  // Insert profile with pending status
  const { error: profileError } = await supabase.from('user_profiles').insert([
    {
      id: userId,
      email: testProfessor.email,
      full_name: testProfessor.full_name,
      user_type: 'professor',
      department: testProfessor.department,
      research_area: testProfessor.research_area,
      account_status: 'pending',
      is_profile_complete: true,
      has_completed_onboarding: false
    }
  ]);

  if (profileError) {
    console.error(`❌ Failed to insert profile for ${testProfessor.email}:`, profileError.message);
    process.exit(1);
  }

  console.log(`✅ Created pending professor account: ${testProfessor.email}`);
  console.log(`🔑 Password: ${testProfessor.password}`);
  console.log(`📧 This account is now pending admin approval`);
  process.exit(0);
}

main();