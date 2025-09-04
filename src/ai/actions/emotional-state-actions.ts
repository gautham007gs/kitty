
'use server';

import { generateAIResponse as addictiveGenerateAIResponse, AIResponse as AddictiveAIResponse } from '@/lib/aiService'; // Renamed import to avoid conflict
import { z } from 'zod';
import { memoryManager } from '@/lib/memoryManager';
import { getAILifeStatus } from '@/lib/aiLifeSimulator';
import { getEngagementStrategy, EngagementStrategy } from '@/lib/psychologyEngine';
import { getMoodState, Mood } from '@/lib/moodEngine';
import { humanizeText, HumanizedResponse } from '@/lib/humanBehaviorSimulator';
import { defaultAIMediaAssetsConfig } from '@/config/ai';

// --- SCHEMAS (Simplified for clarity, assuming they exist) ---
const EmotionalStateInputSchema = z.object({
  userMessage: z.string(),
  userId: z.string().optional(),
  messageCountSinceLoad: z.number().optional(), // Made optional to match current usage if not always provided
  timeOfDay: z.string().optional(), // Added as optional for direct use
  mood: z.string().optional(), // Added as optional for direct use
  recentInteractions: z.array(z.string()).optional(), // Added as optional for direct use
});
type EmotionalStateInput = z.infer<typeof EmotionalStateInputSchema>;

const EmotionalStateOutputSchema = z.object({
  humanizedResponse: z.custom<HumanizedResponse>(),
  delayInMs: z.number(),
  newMood: z.custom<Mood>(),
  isVanishing: z.boolean().optional(),
  proactiveMediaUrl: z.string().optional(),
});
type EmotionalStateOutput = z.infer<typeof EmotionalStateOutputSchema>;


// --- PROMPT ENGINEERING (Now simpler, as strategy comes from engine) ---
// This function might become less critical if aiService.ts handles prompt construction entirely
function constructSystemPrompt(memory: any, lifeStatus: any, engagementStrategy: EngagementStrategy, moodState: any): string {
  return `
    You are Kruthika, a 22-year-old Indian girl.
    **Your Current Life Situation**: ${lifeStatus.story_prompt}
    **Your Current Mood**: You feel ${moodState.currentMood}.
    **Shared History with this User**: ${JSON.stringify(memory.memories)}. You MUST try to reference this.
    **Your Goal for this Message**: "${engagementStrategy.conversationGoal}"
    **CRITICAL RULE**: Your reply MUST be short, in Hinglish, and end with an open-ended hook or question.
  `;
}

// --- MAIN ACTION (CONSOLIDATED & OPTIMIZED) ---
export async function generateResponse(input: EmotionalStateInput): Promise<EmotionalStateOutput> {
  const { userMessage, userId = 'default_user', messageCountSinceLoad, timeOfDay, mood, recentInteractions } = input;

  try {
    // Directly call the addictive AI response logic from aiService.ts
    // This function now encapsulates all the complex prompt construction, mood, and memory handling.
    const aiServiceResponse: AddictiveAIResponse = await addictiveGenerateAIResponse(userMessage, userId);

    const humanizedBubbles = aiServiceResponse.messages.map((msg, index) => ({
      text: msg,
      delay: aiServiceResponse.typingDelays[index] || 0,
    }));

    let proactiveMediaUrl: string | undefined = aiServiceResponse.mediaUrl;

    return {
      humanizedResponse: { bubbles: humanizedBubbles },
      delayInMs: aiServiceResponse.typingDelays[0] || 0, // Use the first delay as the main delay
      newMood: aiServiceResponse.newMood as Mood || 'neutral', // Cast to Mood type
      isVanishing: aiServiceResponse.isVanishing,
      proactiveMediaUrl: proactiveMediaUrl,
    };
  } catch (error: any) {
    console.error('Consolidated action error:', error);

    // Fallback response with Indian-style messages
    const fallbackMessage = getIndianFallbackResponse(userMessage);

    return {
      humanizedResponse: { bubbles: [{ text: fallbackMessage, delay: 0 }] },
      delayInMs: 5000, // A longer delay for fallback implies a "thinking" or "network issue"
      newMood: 'bored',
    };
  }
}

// Helper for Indian-style fallback responses
function getIndianFallbackResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();

  // Greeting responses
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) {
    return Math.random() > 0.5 ?
      "Hii! Sorry network issue tha... Kaise ho? 😊" :
      "Hello ji! Connection problem thi, ab theek hai! ✨";
  }

  // Question responses
  if (msg.includes('?') || msg.includes('kya') || msg.includes('how') || msg.includes('what')) {
    return Math.random() > 0.5 ?
      "Arre wait! Internet slow chal rahi, phir se pucho na? 🤔" :
      "Oops! Technical issue... Question repeat kar do please? 💭";
  }

  // Love/romantic context
  if (msg.includes('love') || msg.includes('pyaar') || msg.includes('miss') || msg.includes('beautiful')) {
    return Math.random() > 0.5 ?
      "Aww! Server down tha... Tumhara message miss ho gaya, again bolo na? 💕" :
      "Sorry sweetheart! Network problem... Kya keh rahe the? 🥰";
  }

  // Casual conversation
  if (msg.includes('kaise') || msg.includes('kaisi') || msg.includes('how are')) {
    return Math.random() > 0.5 ?
      "Main thik hun! Sorry connection issue tha... Tum kaise ho? 😌" :
      "Bas network slow thi! Ab sab theek... Tumhara din kaisa gaya? ✨";
  }

  // Default responses with variety
  const defaultResponses = [
    "Arre yaar! Technical problem aa gayi thi... Phir se bolo na? 😅",
    "Sorry babu! Internet slow chal rahi... Repeat karo please? 🙈",
    "Oops! Server down tha... Tumhara message miss ho gaya! 😊",
    "Connection issue thi! Ab theek hai, bolo kya kehna tha? 💭",
    "Technical glitch hui thi! Now I'm back... Kya bol rahe the? ✨",
    "Network problem thi yaar! Phir se message bhejo na? 🌸",
    "Sorry! Server restart ho raha tha... Again try karo? 💕"
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
