
require('dotenv').config({ path: '.env.local' });

console.log('🔍 COMPLETE SETUP VALIDATION');
console.log('============================');

console.log('\n📋 Environment Variables Check:');
const requiredEnvVars = [
  'GOOGLE_CLOUD_PROJECT_ID',
  'VERTEX_AI_LOCATION',
  'GOOGLE_APPLICATION_CREDENTIALS_JSON',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let allRequired = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';
  console.log(`- ${varName}: ${status}`);
  if (!value) allRequired = false;
});

console.log('\n📋 Optional Environment Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '⚪ NOT SET';
  console.log(`- ${varName}: ${status}`);
});

console.log('\n🔧 Vertex AI Credentials Validation:');
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log('✅ Credentials JSON is valid');
    console.log('📧 Service Account:', credentials.client_email || 'MISSING');
    console.log('🆔 Project ID:', credentials.project_id || 'MISSING');
    console.log('🔑 Private Key:', credentials.private_key ? 'PRESENT' : 'MISSING');
  } catch (error) {
    console.log('❌ Credentials JSON is invalid:', error.message);
    allRequired = false;
  }
} else {
  console.log('❌ No credentials JSON found');
}

console.log('\n🗄️ Supabase Configuration:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('📍 Supabase URL:', supabaseUrl ? '✅ CONFIGURED' : '❌ MISSING');
console.log('🔑 Supabase Key:', supabaseKey ? '✅ CONFIGURED' : '❌ MISSING');

console.log('\n📊 FINAL STATUS:');
if (allRequired && supabaseUrl && supabaseKey) {
  console.log('🎉 ALL SYSTEMS READY! Your app should work perfectly.');
  console.log('✅ Vertex AI: CONFIGURED');
  console.log('✅ Supabase: CONFIGURED');
  console.log('✅ Environment: READY');
} else {
  console.log('❌ SETUP INCOMPLETE! Please fix the missing configurations.');
  if (!allRequired) console.log('- Fix Vertex AI environment variables');
  if (!supabaseUrl || !supabaseKey) console.log('- Fix Supabase environment variables');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: node test-complete-ai-system.js');
console.log('2. Start your development server');
console.log('3. Test the chat functionality');
