#!/usr/bin/env node
/*
  Quick script to manually approve a professor account
  Usage: node scripts/approve-professor.js professor@email.com
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

const professorEmail = process.argv[2];

if (!professorEmail) {
  console.error('❌ Please provide professor email as argument');
  console.log('Usage: node scripts/approve-professor.js professor@email.com');
  process.exit(1);
}

async function main() {
  console.log(`🔍 Looking for professor: ${professorEmail}`);
  
  // Find the professor account
  const { data: professor, error: findError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', professorEmail)
    .eq('user_type', 'professor')
    .single();

  if (findError || !professor) {
    console.error(`❌ Professor not found: ${professorEmail}`);
    console.error('Error:', findError?.message);
    process.exit(1);
  }

  console.log(`📋 Found professor: ${professor.full_name || 'No name'}`);
  console.log(`📋 Current status: ${professor.account_status}`);

  if (professor.account_status === 'approved') {
    console.log('✅ Professor is already approved!');
    process.exit(0);
  }

  // Approve the professor
  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update({ 
      account_status: 'approved',
      updated_at: new Date().toISOString()
    })
    .eq('id', professor.id)
    .select()
    .single();

  if (updateError) {
    console.error(`❌ Failed to approve professor:`, updateError.message);
    process.exit(1);
  }

  console.log(`✅ Successfully approved professor: ${professorEmail}`);
  console.log(`📧 Status changed from "${professor.account_status}" to "approved"`);
  console.log('🎉 Professor can now access the dashboard!');
  
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});