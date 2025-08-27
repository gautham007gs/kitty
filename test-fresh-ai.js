
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testFreshAI() {
  try {
    console.log('🧪 Testing FRESH Vertex AI responses...');
    
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
    
    console.log('🤖 Testing with same message multiple times to check variety...');
    
    // Test same input multiple times to ensure variety
    const testMessage = "sachii mai yarr";
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n🔄 Test ${i}:`);
      
      const randomBreadcrumbCount = Math.floor(Math.random() * 4) + 1;
      const randomMood = ['playful', 'sweet', 'teasing', 'curious'][Math.floor(Math.random() * 4)];
      
      const prompt = `You are Kruthika, a real Indian girl chatting. 
Current mood: ${randomMood}
Generate EXACTLY ${randomBreadcrumbCount} fresh message bubbles.
User said: "${testMessage}"
Reply with ${randomBreadcrumbCount} bubbles (use ||| separator):`;
      
      const result = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });
      
      if (result.response.candidates && result.response.candidates[0]?.content?.parts[0]?.text) {
        const aiResponse = result.response.candidates[0].content.parts[0].text.trim();
        const breadcrumbs = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
        
        console.log(`✅ Response ${i}:`, aiResponse);
        console.log(`🍞 Breadcrumbs ${i}:`, breadcrumbs);
        console.log(`📊 Count: ${breadcrumbs.length} (target: ${randomBreadcrumbCount})`);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n💚 Fresh AI variety test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFreshAI();
