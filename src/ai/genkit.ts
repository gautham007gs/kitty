import { generateAIResponse as pureVertexAIResponse } from '@/lib/aiService';

console.log('🚫 This file is deprecated. All responses now come from src/lib/aiService.ts');

// Redirect all calls to the pure Vertex AI service
export async function generateAIResponse(message: string, userId: string = 'default'): Promise<{
  breadcrumbs: string[];
  delays: number[];
}> {
  console.log('🔄 Redirecting to pure Vertex AI service...');

  try {
    const result = await pureVertexAIResponse(message, userId);
    return {
      breadcrumbs: result.messages,
      delays: result.typingDelays
    };
  } catch (error) {
    console.error('❌ Pure Vertex AI failed:', error);
    throw error;
  }
}

console.log('🎯 All AI responses now use pure Vertex AI from aiService.ts');