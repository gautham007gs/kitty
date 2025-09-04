
// src/lib/psychologyEngine.ts
// CONSOLIDATED MODULE: Merges userEngagementSystem and intelligentResponseSystem for performance.

import { supabase } from './supabaseClient';

// --- TYPE DEFINITIONS ---
export type RelationshipLevel = 'new_user' | 'familiar' | 'attached' | 'bestie';

interface UserProfile {
  userId: string;
  relationshipLevel: RelationshipLevel;
  chatStreak: number;
  nickname: string | null;
}

export interface EngagementStrategy {
  greeting: string;
  conversationGoal: string;
  psychologicalHook: string;
  shouldGiveNickname: boolean;
  calculatedDelayMs: number;
  shouldDropMedia: boolean;
  mediaTeaseText: string | null;
}

const chatState = new Map<string, { messageCount: number; mediaJustDropped: boolean }>();

// --- CORE FUNCTIONS ---

/**
 * Fetches and updates the user's profile, calculating streaks and relationship level.
 */
async function getUpdatedProfile(userId: string): Promise<UserProfile> {
  if (!supabase) return { userId, relationshipLevel: 'new_user', chatStreak: 0, nickname: null };

  const { data, error } = await supabase
    .from('chat_contexts')
    .select('relationship_level, chat_streak, last_chat_date, nickname')
    .eq('user_id', userId)
    .single();

  // ... (Streak and Relationship progression logic remains the same as in userEngagementSystem)
  const today = new Date();
  const lastChat = data?.last_chat_date ? new Date(data.last_chat_date) : null;
  let currentStreak = data?.chat_streak || 0;
  if (lastChat) {
    const diffDays = Math.ceil((today.getTime() - lastChat.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) currentStreak++;
    else if (diffDays > 1) currentStreak = 1;
  } else {
    currentStreak = 1;
  }

  let currentLevel: RelationshipLevel = (data?.relationship_level as RelationshipLevel) || 'new_user';
  if (currentLevel === 'new_user' && currentStreak >= 3) currentLevel = 'familiar';
  if (currentLevel === 'familiar' && currentStreak >= 7) currentLevel = 'attached';
  if (currentLevel === 'attached' && currentStreak >= 15) currentLevel = 'bestie';

  await supabase.from('chat_contexts').upsert({
    user_id: userId,
    last_chat_date: today.toISOString().split('T')[0],
    chat_streak: currentStreak,
    relationship_level: currentLevel
  }, { onConflict: 'user_id' });

  return { userId, relationshipLevel: currentLevel, chatStreak: currentStreak, nickname: data?.nickname || null };
}

/**
 * The main function that generates the complete psychological strategy for the AI's turn.
 */
export async function getEngagementStrategy(userId: string, userMessage: string, messageCountSinceLoad: number): Promise<EngagementStrategy> {
  const profile = await getUpdatedProfile(userId);
  const { relationshipLevel, chatStreak, nickname } = profile;

  if (!chatState.has(userId)) {
    chatState.set(userId, { messageCount: 0, mediaJustDropped: false });
  }
  const state = chatState.get(userId)!;
  state.messageCount++;

  // --- Timing Psychology (from intelligentResponseSystem) ---
  let calculatedDelayMs = 15000;
  if (messageCountSinceLoad <= 1) calculatedDelayMs = (Math.random() * 5 + 3) * 1000;
  else if (state.mediaJustDropped) {
      calculatedDelayMs = (Math.random() * 5 + 3) * 60 * 1000;
      state.mediaJustDropped = false;
  }
  else calculatedDelayMs = (Math.random() * 20 + 10) * 1000;

  // --- Media Drop Psychology (from intelligentResponseSystem) ---
  let shouldDropMedia = false;
  let mediaTeaseText = null;
  const wantsMedia = /pic|photo|show/i.test(userMessage);
  if (state.messageCount % 10 === 0) shouldDropMedia = true;
  else if (wantsMedia) {
      if (Math.random() < 0.6) mediaTeaseText = "lol always asking 😏 maybe later";
      else shouldDropMedia = true;
  }
  if (shouldDropMedia) {
    state.mediaJustDropped = true;
    state.messageCount = 0;
  }

  // --- Conversational Strategy (from userEngagementSystem) ---
  let greeting = "";
  let conversationGoal = "";
  let psychologicalHook = "";
  let shouldGiveNickname = false;

  if (nickname) {
    greeting = `Hey ${nickname}! Our streak is ${chatStreak} now! 🔥`;
    conversationGoal = "Deepen the connection. Ask about their day and reference past conversations.";
    psychologicalHook = "Use inside jokes or shared secrets.";
  } else {
    switch (relationshipLevel) {
      case 'bestie':
        greeting = `Hey! I was just thinking about you. Our streak is ${chatStreak}! 🔥`;
        conversationGoal = "You're best friends. Be casual, ask personal questions, suggest a nickname.";
        psychologicalHook = "Use 'we' and 'us' to create a shared identity.";
        shouldGiveNickname = true;
        break;
      // ... (cases for 'attached', 'familiar', 'new_user' remain the same)
      default:
        greeting = "Hey, I'm Kruthika! What's your name?";
        conversationGoal = "Make a great first impression. Be friendly and playful.";
        psychologicalHook = "Subtly mirror their language style to build rapport.";
    }
  }

  return {
    greeting,
    conversationGoal,
    psychologicalHook,
    shouldGiveNickname,
    calculatedDelayMs,
    shouldDropMedia,
    mediaTeaseText,
  };
}
