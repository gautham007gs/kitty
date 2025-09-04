
import { supabase } from './supabaseClient';
import { LRUCache } from 'lru-cache';

// --- CONSTANTS ---
const MAX_MEMORY_ARRAY_LENGTH = 50; // Cap array lengths for cost control

// --- TYPE DEFINITIONS ---
interface UserMemory {
  name?: string;
  likes?: string[];
  important_events?: string[];
  media_history?: string[];
  [key: string]: any;
}

interface PersonaState {
  current_story?: string;
  mood_reason?: string;
  last_event_mentioned?: string;
}

interface UserContext {
  memory: UserMemory;
  persona: PersonaState;
}

// --- CACHE SETUP (Cost Optimization) ---
const options = {
  max: 500,
  ttl: 1000 * 60 * 15, // Cache items for 15 minutes
};
const cache = new LRUCache<string, UserContext>(options);

// --- FUNCTIONS ---

/**
 * Fetches the context for a given user, prioritizing cache.
 * @param userId The user's unique identifier.
 * @returns The user's context or a default if none exists.
 */
export async function getMemoryContext(userId: string): Promise<UserContext> {
  if (cache.has(userId)) {
    return cache.get(userId)!;
  }

  if (!supabase) return { memory: { media_history: [] }, persona: {} };

  const { data, error } = await supabase
    .from('chat_contexts')
    .select('context_data, personality_state')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "row not found" errors
    console.error('Error fetching user context:', error);
    return { memory: { media_history: [] }, persona: {} };
  }

  const context: UserContext = {
    memory: data?.context_data || { media_history: [] },
    persona: data?.personality_state || { current_story: "Just relaxing at home." },
  };
  
  // Ensure media_history is always an array
  if (!Array.isArray(context.memory.media_history)) {
      context.memory.media_history = [];
  }

  cache.set(userId, context);
  return context;
}

/**
 * Updates the context for a given user in the database and cache.
 * This function now truncates historical arrays to save costs.
 * @param userId The user's unique identifier.
 * @param newMemoryFacts New facts to add/update in the user's memory.
 * @param newPersonaState The new state of the AI's persona.
 */
export async function updateMemoryContext(userId: string, newMemoryFacts: Partial<UserMemory>, newPersonaState: Partial<PersonaState>): Promise<void> {
  const currentContext = await getMemoryContext(userId);

  // Combine old and new memories
  const updatedMemory: UserMemory = {
    ...currentContext.memory,
    ...newMemoryFacts,
    // Combine and keep unique values for arrays
    likes: Array.from(new Set([...(currentContext.memory.likes || []), ...(newMemoryFacts.likes || [])])),
    important_events: Array.from(new Set([...(currentContext.memory.important_events || []), ...(newMemoryFacts.important_events || [])])),
    media_history: Array.from(new Set([...(currentContext.memory.media_history || []), ...(newMemoryFacts.media_history || [])]))
  };

  // --- COST OPTIMIZATION: Truncate long-running memory arrays ---
  if (updatedMemory.likes && updatedMemory.likes.length > MAX_MEMORY_ARRAY_LENGTH) {
    updatedMemory.likes = updatedMemory.likes.slice(-MAX_MEMORY_ARRAY_LENGTH);
  }
  if (updatedMemory.important_events && updatedMemory.important_events.length > MAX_MEMORY_ARRAY_LENGTH) {
    updatedMemory.important_events = updatedMemory.important_events.slice(-MAX_MEMORY_ARRAY_LENGTH);
  }
  if (updatedMemory.media_history && updatedMemory.media_history.length > MAX_MEMORY_ARRAY_LENGTH) {
    updatedMemory.media_history = updatedMemory.media_history.slice(-MAX_MEMORY_ARRAY_LENGTH);
  }
  // --- END COST OPTIMIZATION ---

  const updatedContext: UserContext = {
    memory: updatedMemory,
    persona: { ...currentContext.persona, ...newPersonaState },
  };

  if (supabase) {
    const { error } = await supabase
      .from('chat_contexts')
      .upsert({
        user_id: userId,
        session_id: userId, // Assuming session_id is the same as user_id for this context
        context_data: updatedContext.memory,
        personality_state: updatedContext.persona,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating user context:', error);
    }
  }

  // Update the cache with the latest, truncated context
  cache.set(userId, updatedContext);
}

export const memoryManager = {
  getMemoryContext,
  updateMemoryContext,
};
