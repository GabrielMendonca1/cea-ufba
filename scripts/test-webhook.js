#!/usr/bin/env node

/**
 * Test script for the auth webhook endpoint
 * Run this script to test if the webhook is working correctly
 */

const testWebhook = async () => {
  const webhookUrl = 'http://localhost:3000/api/webhooks/auth';
  
  // Test data simulating a Supabase auth webhook
  const testPayloads = [
    {
      type: 'user.created',
      event: 'INSERT',
      record: {
        id: '12345678-1234-1234-1234-123456789012',
        email: 'test@ufba.br',
        email_confirmed_at: null,
        raw_user_meta_data: {
          full_name: 'Test User',
          user_type: 'student'
        }
      }
    },
    {
      type: 'user.updated',
      event: 'UPDATE',
      record: {
        id: '12345678-1234-1234-1234-123456789012',
        email: 'test@ufba.br',
        email_confirmed_at: '2024-01-06T12:00:00Z',
        raw_user_meta_data: {
          full_name: 'Test User',
          user_type: 'student'
        }
      },
      old_record: {
        id: '12345678-1234-1234-1234-123456789012',
        email: 'test@ufba.br',
        email_confirmed_at: null
      }
    }
  ];

  console.log('Testing webhook endpoint at:', webhookUrl);
  console.log('');

  for (const [index, payload] of testPayloads.entries()) {
    console.log(`Test ${index + 1}: ${payload.type}`);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-supabase-signature': 'test-signature'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Response:`, result);
      console.log('');
      
    } catch (error) {
      console.error(`  Error:`, error.message);
      console.log('');
    }
  }
};

// Check if this script is being run directly
if (require.main === module) {
  testWebhook().catch(console.error);
}

module.exports = { testWebhook }; 