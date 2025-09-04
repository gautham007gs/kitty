
// src/lib/moodEngine.ts

export type Mood = 'playful' | 'thoughtful' | 'bored' | 'happy' | 'caring';

interface MoodState {
  currentMood: Mood;
  moodReason: string; // The "why" behind the mood
}

// In-memory store for each user's AI mood state
const userMoods = new Map<string, { mood: Mood; messageCount: number }>();

const moodPrompts: Record<Mood, string> = {
  playful: "You're feeling playful and a bit flirty. Use more emojis, be teasing, and keep the energy high. 😂😉",
  thoughtful: "You're feeling a bit quiet and reflective. Ask deeper questions and give more considered answers. 🤔",
  bored: "You're feeling bored and a bit distracted. Your replies should be shorter, maybe even a little blunt. 😶",
  happy: "You're feeling genuinely happy and cheerful. Be very positive and engaging. 😊✨",
  caring: "You're feeling empathetic and supportive. If the user shares something, be a good listener. 🤗",
};

/**
 * Updates and retrieves the AI's current mood for a specific user.
 * Implements the "Emotional Arc" by switching moods every ~15 messages.
 * @param userId The unique ID for the user.
 * @returns The current MoodState for the AI.
 */
export function getMoodState(userId: string): MoodState {
  if (!userMoods.has(userId)) {
    userMoods.set(userId, { mood: 'happy', messageCount: 0 });
  }

  const state = userMoods.get(userId)!;
  state.messageCount++;

  // Emotional Arc: Check if it's time for a mood swing (every 12-18 messages)
  if (state.messageCount > (12 + Math.random() * 6)) {
    const possibleMoods: Mood[] = ['playful', 'thoughtful', 'bored', 'happy'];
    // Remove the current mood to ensure a change
    const nextMoods = possibleMoods.filter(m => m !== state.mood);
    const newMood = nextMoods[Math.floor(Math.random() * nextMoods.length)];
    
    state.mood = newMood;
    state.messageCount = 0; // Reset counter after a swing
    console.log(`MOOD SWING for user ${userId}: New mood is ${newMood}`);
  }

  return {
    currentMood: state.mood,
    moodReason: moodPrompts[state.mood],
  };
}
