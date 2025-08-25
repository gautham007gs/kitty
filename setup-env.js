
const fs = require('fs');

console.log('🔧 Setting up environment for Vertex AI...');

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  const envTemplate = `# Google Cloud Vertex AI Configuration
GOOGLE_CLOUD_PROJECT_ID=maya-chatbot-470113
VERTEX_AI_LOCATION=us-central1

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bpuomibpspgjftzjrbap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Google Application Credentials (paste your complete service account JSON here)
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"maya-chatbot-470113","private_key_id":"your-private-key-id","private_key":"-----BEGIN PRIVATE KEY-----\\nYour-Private-Key-Here\\n-----END PRIVATE KEY-----\\n","client_email":"vertex-ai-service@maya-chatbot-470113.iam.gserviceaccount.com","client_id":"your-client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"your-cert-url","universe_domain":"googleapis.com"}
`;

  fs.writeFileSync('.env.local', envTemplate);
  console.log('✅ Created .env.local template');
} else {
  console.log('✅ .env.local already exists');
}

console.log(`
📋 Setup Instructions:
1. Get your complete service account JSON from Google Cloud Console
2. Replace the GOOGLE_APPLICATION_CREDENTIALS_JSON value in .env.local
3. Make sure the JSON includes ALL fields, especially the private_key
4. Run: node validate-credentials.js to verify
5. Run your app!

🔗 Get credentials from: https://console.cloud.google.com/iam-admin/serviceaccounts
`);
