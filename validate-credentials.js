
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

function validateCredentials() {
  console.log('🔍 Validating Google Cloud Credentials...');
  
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  
  if (!credentialsJson) {
    console.error('❌ GOOGLE_APPLICATION_CREDENTIALS_JSON not found in environment');
    return false;
  }
  
  try {
    const credentials = JSON.parse(credentialsJson);
    console.log('✅ JSON is valid');
    
    const requiredFields = [
      'type',
      'project_id', 
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri'
    ];
    
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!credentials[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return false;
    }
    
    console.log('✅ All required fields present');
    console.log('📧 Service account:', credentials.client_email);
    console.log('🆔 Project ID:', credentials.project_id);
    console.log('🔑 Private key format:', credentials.private_key ? 'Present' : 'Missing');
    
    return true;
    
  } catch (error) {
    console.error('❌ Invalid JSON format:', error.message);
    return false;
  }
}

validateCredentials();
