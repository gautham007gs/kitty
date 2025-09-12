
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testYourAISetup() {
  try {
    console.log('🧪 Testing YOUR AI setup with your credentials...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('📋 Your Configuration:');
    console.log('- Project ID:', projectId);
    console.log('- Location:', location);
    console.log('- Has Credentials:', !!credentialsJson);
    
    if (!projectId || !credentialsJson) {
      throw new Error('Missing required environment variables');
    }

    const credentials = JSON.parse(credentialsJson);
    console.log('✅ Service Account:', credentials.client_email);
    console.log('🆔 Project:', credentials.project_id);

    // Initialize Vertex AI with your exact credentials
    const vertexAI = new VertexAI({
      project: credentials.project_id,
      location: location,
      googleAuthOptions: {
        credentials: {
          type: credentials.type,
          project_id: credentials.project_id,
          private_key_id: credentials.private_key_id,
          private_key: credentials.private_key.replace(/\\n/g, '\n'),
          client_email: credentials.client_email,
          client_id: credentials.client_id,
          universe_domain: credentials.universe_domain
        }
      }
    });
    
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 1.0,
        topP: 0.9
      }
    });
    
    console.log('🤖 Testing Maya AI personality...');
    
    const testPrompt = `You are Maya, a 21-year-old Indian girl chatting on WhatsApp. Reply naturally to: "hey maya, how are you?"

Reply with 1-2 short messages like a real person would. If multiple messages, separate with "|||":`;
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: testPrompt }]
      }]
    });
    
    const response = result.response;
    if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
      const aiResponse = response.candidates[0].content.parts[0].text.trim();
      const messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
      
      console.log('✅ SUCCESS! Maya AI is working!');
      console.log('🎉 Maya says:', aiResponse);
      console.log('💬 Message bubbles:', messages);
      console.log('📊 Total messages:', messages.length);
      
      // Test another conversation
      console.log('\n🔄 Testing another conversation...');
      
      const result2 = await model.generateContent({
        contents: [{
          role: 'user',
          parts: [{ text: `You are Maya. Reply to: "what are you doing right now?" Keep it casual and short:` }]
        }]
      });
      
      const response2 = result2.response;
      if (response2.candidates && response2.candidates[0]?.content?.parts[0]?.text) {
        const aiResponse2 = response2.candidates[0].content.parts[0].text.trim();
        console.log('✅ Second test successful!');
        console.log('🎉 Maya says:', aiResponse2);
      }
      
      console.log('\n💚 YOUR AI IS WORKING PERFECTLY! 🎉');
      console.log('🚀 Your Maya chatbot is ready to give natural, engaging replies!');
      
    } else {
      console.log('❌ No response received from AI');
      console.log('📋 Response structure:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication issue - check your service account credentials');
    }
    
    if (error.message.includes('project')) {
      console.error('📁 Project issue - verify project ID and API enablement');
    }
    
    console.error('📋 Full error:', error);
  }
}

testYourAISetup();
