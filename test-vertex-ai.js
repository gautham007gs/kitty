
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testVertexAI() {
  try {
    console.log('🧪 Testing Vertex AI setup...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION;
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('Project ID:', projectId);
    console.log('Location:', location);
    console.log('Has credentials:', !!credentialsJson);
    
    const credentials = JSON.parse(credentialsJson);
    
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: {
        credentials: credentials
      }
    });
    
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.7
      }
    });
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Say hello in one sentence as Kruthika' }]
      }]
    });
    
    const response = result.response;
    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      console.log('✅ Test successful!');
      console.log('Response:', response.candidates[0].content.parts[0].text);
    } else {
      console.log('❌ No response received');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testVertexAI();
