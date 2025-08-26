
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testVertexAI() {
  try {
    console.log('🧪 Testing Vertex AI setup...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('📋 Configuration:');
    console.log('- Project ID:', projectId);
    console.log('- Location:', location);
    console.log('- Credentials JSON length:', credentialsJson ? credentialsJson.length : 'MISSING');
    
    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    // Parse and validate credentials
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
      console.log('✅ Credentials parsed successfully');
      console.log('📧 Service account:', credentials.client_email);
      console.log('🆔 Project from creds:', credentials.project_id);
    } catch (parseError) {
      console.error('❌ Failed to parse credentials JSON:', parseError.message);
      console.error('🔍 First 200 chars:', credentialsJson.substring(0, 200));
      throw parseError;
    }

    // Validate required fields
    const requiredFields = ['client_email', 'private_key', 'project_id'];
    const missingFields = requiredFields.filter(field => !credentials[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing credential fields: ${missingFields.join(', ')}`);
    }

    console.log('🔧 Initializing Vertex AI...');
    
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: {
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
          project_id: credentials.project_id,
          type: 'service_account'
        }
      }
    });
    
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-lite-001',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7,
        topP: 0.8
      }
    });
    
    console.log('🤖 Testing AI generation...');
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Say "Hello! I am Kruthika and I am working!" in one sentence.' }]
      }]
    });
    
    const response = result.response;
    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      console.log('✅ Test successful!');
      console.log('🎉 AI Response:', response.candidates[0].content.parts[0].text);
      console.log('💚 Vertex AI is working correctly!');
    } else {
      console.log('❌ No response received from AI');
      console.log('📋 Full response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.message && error.message.includes('Invalid JWT')) {
      console.error('🔐 JWT/Authentication issue - check service account key format');
    }
    
    if (error.message && error.message.includes('authentication')) {
      console.error('🔐 General authentication issue - verify service account permissions');
    }
    
    if (error.message && error.message.includes('project')) {
      console.error('📁 Project issue - verify project ID and API enablement');
    }
    
    console.error('📋 Full error details:', error);
  }
}

testVertexAI();
