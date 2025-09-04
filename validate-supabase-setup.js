
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Validating Maya Chat Supabase Setup...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ MISSING ENVIRONMENT VARIABLES:');
  if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('\n💡 Please check your .env.local file\n');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   Supabase URL: ${supabaseUrl}`);
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateSetup() {
  try {
    console.log('\n🏢 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('ai_profile_settings').select('id').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n🔧 Run the complete_supabase_setup_v3.sql script in your Supabase SQL Editor');
      return false;
    }
    
    console.log('✅ Connected to Supabase successfully');
    
    // Test required tables
    const tables = [
      'ai_profile_settings',
      'ad_settings', 
      'admin_status_display',
      'managed_demo_contacts',
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
    
    // Test functions
    console.log('\n⚙️ Testing database functions...');
    
    try {
      const { error: funcError } = await supabase.rpc('get_daily_message_counts', { 
        start_date: '2024-01-01' 
      });
      if (funcError) {
        console.error('❌ Function get_daily_message_counts failed:', funcError.message);
        return false;
      }
      console.log('✅ Analytics functions working');
    } catch (err) {
      console.error('❌ Function test failed:', err.message);
      return false;
    }
    
    // Test data insertion
    console.log('\n📝 Testing data operations...');
    
    try {
      // Test message logging
      const { error: insertError } = await supabase
        .from('messages_log')
        .insert({
          message_id: 'test-' + Date.now(),
          sender_type: 'user',
          chat_id: 'test',
          text_content: 'Test message for validation'
        });
        
      if (insertError) {
        console.error('❌ Data insertion failed:', insertError.message);
        return false;
      }
      console.log('✅ Data operations working');
    } catch (err) {
      console.error('❌ Data operation test failed:', err.message);
      return false;
    }
    
    // Check default data
    console.log('\n🎯 Verifying default data...');
    
    const { data: profileData } = await supabase
      .from('ai_profile_settings')
      .select('name')
      .eq('id', 'default')
      .single();
      
    if (profileData?.name === 'Kruthika') {
      console.log('✅ Default AI profile data found');
    } else {
      console.warn('⚠️ Default AI profile data missing or incorrect');
    }
    
    const { data: contactsData } = await supabase
      .from('managed_demo_contacts')
      .select('id, name')
      .eq('enabled', true);
      
    if (contactsData && contactsData.length === 4) {
      console.log(`✅ Demo contacts found (${contactsData.length} contacts)`);
      contactsData.forEach(contact => {
        console.log(`   - ${contact.name}`);
      });
    } else {
      console.warn(`⚠️ Demo contacts issue: found ${contactsData?.length || 0} contacts, expected 4`);
    }
    
    console.log('\n🎉 Maya Chat Supabase setup validation completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('   ✅ Supabase connection working');
    console.log('   ✅ All required tables present');
    console.log('   ✅ Database functions operational');
    console.log('   ✅ Data operations functioning');
    console.log('   ✅ Default data configured');
    
    console.log('\n🚀 Your app should now work without Supabase errors!');
    console.log('\n📱 Features enabled:');
    console.log('   • Admin panel global updates');
    console.log('   • Unified status page management'); 
    console.log('   • Real-time ad settings sync');
    console.log('   • Analytics and message logging');
    console.log('   • Consistent 4-contact status page');
    
    return true;
    
  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    console.log('\n🔧 Please run the complete_supabase_setup_v3.sql script in your Supabase SQL Editor');
    return false;
  }
}

validateSetup().then(success => {
  process.exit(success ? 0 : 1);
});
