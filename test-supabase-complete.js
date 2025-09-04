
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Complete Supabase Setup for Maya Chat...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.log('Please ensure these are set in your .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCompleteSetup() {
  try {
    console.log('🏢 Testing Supabase connection...');
    
    // Test all required tables
    const tables = [
      'ai_profile_settings',
      'ad_settings', 
      'ai_media_assets',
      'messages_log',
      'daily_activity_log',
      'app_configurations'
    ];
    
    console.log('\n📊 Checking tables...');
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
          return false;
        }
        console.log(`✅ Table '${table}' - OK`);
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
        return false;
      }
    }
    
    // Test profile settings
    console.log('\n👤 Testing AI Profile Settings...');
    const { data: profile, error: profileError } = await supabase
      .from('ai_profile_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    if (profileError) {
      console.log('❌ Profile settings error:', profileError.message);
    } else {
      console.log('✅ Profile settings loaded');
      console.log('   Name:', profile.settings.name);
      console.log('   Avatar URL:', profile.settings.avatarUrl ? 'Set' : 'Missing');
    }
    
    // Test ad settings
    console.log('\n📢 Testing Ad Settings...');
    const { data: ads, error: adsError } = await supabase
      .from('ad_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    
    if (adsError) {
      console.log('❌ Ad settings error:', adsError.message);
    } else {
      console.log('✅ Ad settings loaded');
      console.log('   Ads Enabled:', ads.settings.adsEnabledGlobally);
      console.log('   Adsterra Direct Link:', ads.settings.adsterraDirectLinkEnabled);
    }
    
    // Test message logging
    console.log('\n💬 Testing Message Logging...');
    const testMessage = {
      chat_id: 'test_chat',
      sender: 'user',
      text: 'Test message from setup validation',
      message_type: 'text'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('messages_log')
      .insert(testMessage)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Message insert error:', insertError.message);
    } else {
      console.log('✅ Message logging works');
      console.log('   Message ID:', insertData.id);
      
      // Clean up test message
      await supabase.from('messages_log').delete().eq('id', insertData.id);
      console.log('✅ Test message cleaned up');
    }
    
    // Test functions
    console.log('\n⚙️ Testing Database Functions...');
    try {
      const { data: msgCounts, error: funcError } = await supabase
        .rpc('get_daily_message_counts', { start_date: '2024-01-01' });
      
      if (funcError) {
        console.log('❌ Function error:', funcError.message);
      } else {
        console.log('✅ Message count function works');
      }
    } catch (err) {
      console.log('❌ Function test failed:', err.message);
    }
    
    console.log('\n🎉 Supabase setup validation complete!');
    console.log('✅ Your database is ready for Maya Chat');
    
    return true;
    
  } catch (error) {
    console.error('❌ Setup validation failed:', error.message);
    return false;
  }
}

testCompleteSetup().then(success => {
  if (success) {
    console.log('\n🚀 You can now start your application with: npm run dev');
  } else {
    console.log('\n💡 Please run the SQL setup script in your Supabase dashboard');
    console.log('   File: complete_supabase_setup_final.sql');
  }
  process.exit(success ? 0 : 1);
});
