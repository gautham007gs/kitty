
// Test script to validate ad functionality
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bpuomibpspgjftzjrbap.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdW9taWJwc3BnamZ0empyYmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxMTk3MTksImV4cCI6MjA3MTY5NTcxOX0.CufFDa4WEgEflXRjxkx95HqomVbJZIlR_Ce6vhEteZI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdSettings() {
  console.log('🔍 Testing Supabase Ad Settings Connection...');
  
  try {
    // Test 1: Check ad_settings table
    console.log('\n📋 Testing ad_settings table...');
    const { data: adSettings, error: adError } = await supabase
      .from('ad_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (adError) {
      console.error('❌ Error fetching ad_settings:', adError.message);
    } else {
      console.log('✅ Ad settings loaded successfully');
      console.log('📊 Current settings:', {
        adsEnabled: adSettings.ads_enabled_globally,
        adsterraBanner: adSettings.adsterra_banner_enabled,
        adsterraNative: adSettings.adsterra_native_banner_enabled,
        adsterraSocialBar: adSettings.adsterra_social_bar_enabled,
        adsterraPopunder: adSettings.adsterra_popunder_enabled,
        monetagBanner: adSettings.monetag_banner_enabled,
        monetagNative: adSettings.monetag_native_banner_enabled,
        monetagSocialBar: adSettings.monetag_social_bar_enabled,
        monetagPopunder: adSettings.monetag_popunder_enabled
      });
    }

    // Test 2: Check app_configurations table as fallback
    console.log('\n📋 Testing app_configurations fallback...');
    const { data: configData, error: configError } = await supabase
      .from('app_configurations')
      .select('*');
    
    if (configError) {
      console.error('❌ Error fetching app_configurations:', configError.message);
    } else {
      console.log('✅ App configurations table accessible');
      console.log('📊 Available configs:', configData.map(c => c.id));
    }

    // Test 3: Database connection
    console.log('\n🔍 Testing general database connection...');
    const { data, error } = await supabase
      .from('ai_profiles')
      .select('count', { count: 'exact' });

    if (error) {
      console.error('❌ Database connection error:', error.message);
    } else {
      console.log('✅ Database connection successful');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

testAdSettings();
