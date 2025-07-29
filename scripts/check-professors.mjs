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
} catch (error) {
  console.log('⚠️  Could not load .env.local file:', error.message);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  // Check all professors
  const { data: professors, error } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, user_type, account_status')
    .eq('user_type', 'professor');

  if (error) {
    console.error('❌ Error fetching professors:', error);
    process.exit(1);
  }

  console.log('📋 All professor accounts:');
  console.table(professors);

  // Check specifically pending ones
  const pending = professors?.filter(p => p.account_status === 'pending') || [];
  console.log(`\n📊 Summary: ${professors?.length || 0} total professors, ${pending.length} pending approval`);
  
  process.exit(0);
}

main();