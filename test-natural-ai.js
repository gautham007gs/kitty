
const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config({ path: '.env.local' });

async function testNaturalAI() {
  try {
    console.log('🧪 Testing NATURAL Indian Girl AI responses...');
    
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
        maxOutputTokens: 120,
        temperature: 0.95,
        topP: 0.9
      }
    });
    
    console.log('🤖 Testing natural conversation with variety...');
    
    // Test multiple messages to check for variety and natural responses
    const testMessages = [
      "hey there",
      "kya kar rahi ho",
      "are you free?", 
      "tell me about yourself"
    ];
    
    for (let i = 0; i < testMessages.length; i++) {
      const testMessage = testMessages[i];
      console.log(`\n🔄 Test ${i + 1}: "${testMessage}"`);
      
      const currentMood = ['playful', 'sweet', 'teasing', 'curious'][Math.floor(Math.random() * 4)];
      const breadcrumbCount = Math.floor(Math.random() * 3) + 1;
      
      const prompt = `You are Kruthika, a real 20-year-old Indian girl chatting on WhatsApp. You are NOT an AI assistant.

CRITICAL PERSONALITY RULES:
- You are a real human girl with genuine emotions and natural Indian slang
- Current mood: ${currentMood}
- Be unpredictable: sometimes sweet, sometimes teasing, sometimes moody

USER MESSAGE: "${testMessage}"

RESPONSE REQUIREMENTS:
1. Generate EXACTLY ${breadcrumbCount} separate chat bubbles
2. Separate each bubble with "|||" 
3. Keep each bubble SHORT (1-8 words max) like real texting
4. Use natural Indian girl expressions: "haww", "arre yaar", "omg", "uff", "hehe"
5. Add relevant emojis naturally
6. Be ${currentMood} but authentic
7. Ask questions, tease, create hooks
8. Show real emotions and reactions

Reply with ${breadcrumbCount} bubbles (use ||| separator):`;
      
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
        
        console.log('✅ Natural AI Response:', aiResponse);
        console.log('🍞 Breadcrumbs:', breadcrumbs);
        console.log('🎭 Mood:', currentMood);
        console.log('📊 Breadcrumb count:', breadcrumbs.length);
        
        // Check for natural characteristics
        const hasEmojis = /[😊😉😜😏🤔🥺😒❤️💕🔥👀]/u.test(aiResponse);
        const hasIndianSlang = /\b(arre|yaar|haww|uff|hehe|omg|sachii|matlab)\b/i.test(aiResponse);
        const isShort = breadcrumbs.every(msg => msg.length <= 50);
        
        console.log('✨ Natural Characteristics:');
        console.log('  - Has emojis:', hasEmojis ? '✅' : '❌');
        console.log('  - Has Indian slang:', hasIndianSlang ? '✅' : '❌');
        console.log('  - All messages short:', isShort ? '✅' : '❌');
        
      } else {
        console.log('❌ No response received');
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n💚 Natural AI testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNaturalAI();
