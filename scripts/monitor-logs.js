#!/usr/bin/env node

/**
 * Log monitoring utility for debugging signup issues
 * This script helps monitor both application and database logs
 */

const { createClient } = require('@supabase/supabase-js');

// Helper function to format timestamps
const formatTime = (date = new Date()) => {
  return date.toISOString().replace('T', ' ').replace('Z', '');
};

// Helper function to check database logs
const checkDatabaseLogs = async () => {
  console.log('\n🔍 Checking recent database logs...');
  
  // This would require access to your Supabase logs
  // For now, we'll provide instructions on how to check them
  console.log('📋 To check database logs in Supabase:');
  console.log('   1. Go to your Supabase Dashboard');
  console.log('   2. Navigate to Logs → Database');
  console.log('   3. Look for messages starting with "handle_new_user:"');
  console.log('   4. Check for any WARNING or ERROR messages');
  console.log('');
};

// Helper function to simulate a signup test
const testSignupFlow = async () => {
  console.log('🧪 Testing signup flow...');
  
  const testData = {
    email: 'test@ufba.br',
    password: 'test123456',
    full_name: 'Test User',
    user_type: 'student'
  };
  
  console.log('Test data that would be sent:', testData);
  console.log('');
  console.log('📝 Expected log sequence:');
  console.log('   1. ✅ All validations passed');
  console.log('   2. 🔄 Attempting Supabase signup with metadata');
  console.log('   3. ✅ User created successfully OR ❌ Auth signup error');
  console.log('   4. Database trigger: "handle_new_user: Starting profile creation"');
  console.log('   5. Database trigger: "handle_new_user: Successfully created profile" OR error');
  console.log('   6. ✅ Signup completed');
  console.log('');
};

// Main monitoring function
const monitorLogs = () => {
  console.log('🚀 Signup Log Monitor Started');
  console.log('=' .repeat(50));
  console.log(`📅 Started at: ${formatTime()}`);
  console.log('');
  
  console.log('📋 Instructions for debugging:');
  console.log('');
  
  console.log('1. 🖥️  Monitor Application Logs:');
  console.log('   • Open terminal and run: npm run dev');
  console.log('   • Look for logs starting with === SIGNUP ACTION START ===');
  console.log('   • Check for ❌ errors or ✅ success messages');
  console.log('');
  
  console.log('2. 🗄️  Monitor Database Logs:');
  console.log('   • Go to Supabase Dashboard → Logs → Database');
  console.log('   • Filter by "handle_new_user" to see trigger logs');
  console.log('   • Look for WARNING or ERROR messages');
  console.log('');
  
  console.log('3. 🧪 Test the Signup:');
  console.log('   • Go to http://localhost:3000/sign-up');
  console.log('   • Fill in the form and submit');
  console.log('   • Check both application and database logs');
  console.log('');
  
  testSignupFlow();
  checkDatabaseLogs();
  
  console.log('💡 Common Issues to Look For:');
  console.log('   • Missing or invalid user_type in metadata');
  console.log('   • Database connection issues');
  console.log('   • Permission errors on user_profiles table');
  console.log('   • Enum casting errors (student/professor)');
  console.log('   • Row Level Security policy violations');
  console.log('');
  
  console.log('🔧 Quick Fixes:');
  console.log('   • Verify user_type is "student" or "professor"');
  console.log('   • Check if user_profiles table exists');
  console.log('   • Verify RLS policies allow INSERT');
  console.log('   • Check database trigger is properly installed');
  console.log('');
  
  console.log('🎯 Next Steps:');
  console.log('   1. Try creating an account at http://localhost:3000/sign-up');
  console.log('   2. Monitor the logs in both terminal and Supabase dashboard');
  console.log('   3. Share any error messages you see');
  console.log('');
};

// Export for use in other scripts
module.exports = { monitorLogs, formatTime };

// Run if called directly
if (require.main === module) {
  monitorLogs();
} 