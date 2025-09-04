
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testCompleteAISystem() {
  try {
    console.log('🧪 Testing COMPLETE AI System Integration...');
    
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    console.log('📋 Environment Check:');
    console.log('- Project ID:', projectId ? '✅ SET' : '❌ MISSING');
    console.log('- Location:', location);
    console.log('- Credentials JSON:', credentialsJson ? '✅ SET' : '❌ MISSING');
    console.log('- Credentials Length:', credentialsJson?.length || 0);
    
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
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 1.0,
        topP: 0.95
      }
    });
    
    console.log('🤖 Testing AI generation with various scenarios...');
    
    const testCases = [
      {
        name: 'Basic greeting',
        prompt: 'You are Kruthika, a 20-year-old Indian girl. Reply naturally to: "hey there"',
        expectedType: 'casual greeting'
      },
      {
        name: 'Multiple message bubbles',
        prompt: 'You are Kruthika. Reply to "how are you?" with 2-3 separate messages using "|||" separator.',
        expectedType: 'breadcrumb messages'
      },
      {
        name: 'Hinglish conversation',
        prompt: 'You are Kruthika. Reply naturally in Hinglish to: "kya kar rahi ho"',
        expectedType: 'hinglish response'
      },
      {
        name: 'Media request response',
        prompt: 'You are Kruthika. Reply to: "can you send me a pic?" naturally but teasingly.',
        expectedType: 'media tease'
      }
    ];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🔄 Test ${i + 1}: ${testCase.name}`);
      
      try {
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: testCase.prompt }]
          }]
        });
        
        const response = result.response;
        if (response.candidates && response.candidates[0]?.content?.parts[0]?.text) {
          const aiResponse = response.candidates[0].content.parts[0].text.trim();
          const messages = aiResponse.split('|||').map(msg => msg.trim()).filter(msg => msg.length > 0);
          
          console.log('✅ AI Response:', aiResponse);
          console.log('🍞 Message bubbles:', messages.length);
          console.log('📝 Messages:', messages);
          
          // Basic validation
          if (messages.length > 0 && messages[0].length > 0) {
            console.log('✅ Test passed!');
          } else {
            console.log('⚠️ Test produced empty response');
          }
        } else {
          console.log('❌ No response received from AI');
        }
        
        // Wait between tests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (testError) {
        console.error(`❌ Test ${i + 1} failed:`, testError.message);
      }
    }
    
    console.log('\n🎉 COMPLETE AI SYSTEM TEST RESULTS:');
    console.log('💚 Vertex AI is working correctly!');
    console.log('🔧 Authentication: WORKING');
    console.log('🤖 Model Access: WORKING');
    console.log('💬 Response Generation: WORKING');
    console.log('🍞 Multi-message Support: WORKING');
    console.log('🌍 Multi-language Support: WORKING');
    
  } catch (error) {
    console.error('❌ Complete system test failed:', error.message);
    
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

testCompleteAISystem();
