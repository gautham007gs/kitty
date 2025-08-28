
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testPureVertexAI() {
  try {
    console.log('🧪 Testing PURE Vertex AI System...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('📋 Configuration:');
    console.log('- Project ID:', projectId);
    console.log('- Location:', location);
    console.log('- Credentials Available:', credentialsJson ? 'YES' : 'NO');
    
    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('✅ Service Account:', credentials.client_email);
    
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
    
    console.log('🤖 Testing pure Vertex AI responses...');
    
    const testMessages = [
      "hey there",
      "kya kar rahi ho",
      "tell me about yourself"
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const testMessage = testMessages[i];
      console.log(`\n🔄 Test ${i + 1}: "${testMessage}"`);
      
      const prompt = `You are Kruthika, a real 20-year-old Indian girl chatting naturally on WhatsApp.

USER SAID: "${testMessage}"

Generate 1-2 natural responses like a real Indian girl would. If multiple responses, separate with "|||":`;
      
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });
      
      const response = result.response;
      if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
        const aiResponse = response.candidates[0].content.parts[0].text.trim();
        const messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
        
        console.log('✅ AI Response:', aiResponse);
        console.log('🍞 Message bubbles:', messages);
        console.log('📊 Bubble count:', messages.length);
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n💚 Pure Vertex AI system is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPureVertexAI();
