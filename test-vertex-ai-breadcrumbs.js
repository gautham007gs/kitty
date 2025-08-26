
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testVertexAIBreadcrumbs() {
  try {
    console.log('🧪 Testing Vertex AI with breadcrumb responses...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    const credentials = JSON.parse(credentialsJson);
    
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
        maxOutputTokens: 150,
        temperature: 0.9,
        topP: 0.9
      }
    });
    
    console.log('🤖 Testing breadcrumb AI generation...');
    
    const prompt = `Reply like a real Indian girl. Break your response into separate messages using "|||" separator. Example: "Hi 😊|||What r u doing?|||Tell me something!"

User message: "Hello how are you?"

Reply (use |||):`;
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }]
    });
    
    const response = result.response;
    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      const breadcrumbs = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      console.log('✅ Test successful!');
      console.log('🎉 AI Response:', aiResponse);
      console.log('🍞 Breadcrumbs:', breadcrumbs);
      console.log('📊 Breadcrumb count:', breadcrumbs.length);
      console.log('💚 Vertex AI breadcrumb system is working!');
    } else {
      console.log('❌ No response received from AI');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVertexAIBreadcrumbs();
