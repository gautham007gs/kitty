
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Validating Complete Maya Chat Setup...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('\n💡 Please check your .env.local file\n');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateCompleteSetup() {
  try {
    console.log('\n🏢 Testing Supabase connection...');
    
    // Test connection with a simple query
    const { data, error } = await supabase.from('app_configurations').select('id').limit(1);
    
    if (error && error.code === '42P01') {
      console.error('❌ Table "app_configurations" does not exist');
      console.log('\n🔧 Please run the SQL setup script from SUPABASE_SETUP.md in your Supabase SQL Editor');
      return false;
    } else if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Test required tables
    const tables = [
      'app_configurations',
      'messages_log',
      'daily_activity_log'
    ];
    
    console.log('\n📊 Checking required tables...');
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select('id').limit(1);
        if (tableError) {
          console.error(`❌ Table '${table}' error:`, tableError.message);
          return false;
        }
        console.log(`✅ Table '${table}' exists and accessible`);
      } catch (err) {
        console.error(`❌ Table '${table}' check failed:`, err.message);
        return false;
      }
    }
    
    // Test database functions
    console.log('\n⚙️ Testing database functions...');
    
    try {
      const { error: funcError } = await supabase.rpc('get_daily_message_counts', { 
        start_date: '2024-01-01' 
      });
      
      if (funcError) {
        console.log('❌ Function error:', funcError.message);
        console.log('💡 Run the function creation SQL from SUPABASE_SETUP.md');
        return false;
      } else {
        console.log('✅ Database functions working');
      }
    } catch (err) {
      console.log('❌ Function test failed:', err.message);
      return false;
    }
    
    // Test app configurations
    console.log('\n⚙️ Testing app configurations...');
    const { data: configs, error: configError } = await supabase
      .from('app_configurations')
      .select('*')
      .eq('id', 'ad_settings_kruthika_chat_v1')
      .single();
    
    if (configError && configError.code === 'PGRST116') {
      console.log('⚠️  No ad_settings configuration found - will be created on first admin save');
    } else if (configError) {
      console.log('❌ Config error:', configError.message);
    } else {
      console.log('✅ App configurations working');
    }
    
    console.log('\n🎉 Setup validation completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Visit /admin/login to access admin panel');
    console.log('3. Create an admin user in Supabase Auth dashboard if needed');
    
    return true;
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

validateCompleteSetup().then(success => {
  process.exit(success ? 0 : 1);
});
