#!/usr/bin/env node
/*
  Seed script to create fixed admin accounts in Supabase.
  Usage:  node scripts/seed-admins.js

  Requirements:
  • SUPABASE_SERVICE_ROLE_KEY – found in Supabase project settings (never expose publicly)
  • NEXT_PUBLIC_SUPABASE_URL  – your Supabase project URL

  The script is idempotent: if an admin user already exists, it will skip it.
*/

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

const admins = [
  {
    email: 'admin1@cea.ufba.br',
    password: 'AdminPass#1',
    full_name: 'Administrador 1'
  },
  {
    email: 'admin2@cea.ufba.br',
    password: 'AdminPass#2',
    full_name: 'Administrador 2'
  },
  {
    email: 'admin3@cea.ufba.br',
    password: 'AdminPass#3',
    full_name: 'Administrador 3'
  }
];

async function main() {
  for (const admin of admins) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', admin.email)
      .single();

    if (existing) {
      // Update existing user to admin if not already
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          user_type: 'admin',
          account_status: 'approved',
          is_profile_complete: true,
          has_completed_onboarding: true,
          full_name: admin.full_name
        })
        .eq('email', admin.email);

      if (updateError) {
        console.error(`❌ Failed to update ${admin.email} to admin:`, updateError.message);
      } else {
        console.log(`✅ Updated ${admin.email} to admin`);
      }
      continue;
    }

    // Create auth user via Admin API so email confirmation not required
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true
    });

    if (authError) {
      console.error(`❌ Failed to create auth user ${admin.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;

    // Insert profile
    const { error: profileError } = await supabase.from('user_profiles').insert([
      {
        id: userId,
        email: admin.email,
        full_name: admin.full_name,
        user_type: 'admin',
        account_status: 'approved',
        is_profile_complete: true,
        has_completed_onboarding: true
      }
    ]);

    if (profileError) {
      console.error(`❌ Failed to insert profile for ${admin.email}:`, profileError.message);
    } else {
      console.log(`✅ Created admin ${admin.email}`);
    }
  }

  console.log('🎉 Admin seeding finished');
  process.exit(0);
}

main(); 