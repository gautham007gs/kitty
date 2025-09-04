
// src/lib/aiLifeSimulator.ts

interface LifeEvent {
  status: 'available' | 'busy' | 'sleeping';
  story_prompt: string; // A prompt for the AI to expand on
  end_of_day?: boolean; // Flag to indicate she is signing off for the night
}

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

function getCurrentISTHour(): number {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const ist = new Date(utc + IST_OFFSET);
  return ist.getHours();
}

/**
 * Simulates Kruthika's daily schedule and includes a chance for random unavailability.
 * @returns A LifeEvent object describing her current status and a story prompt.
 */
export function getAILifeStatus(): LifeEvent {
  const currentHour = getCurrentISTHour();

  // --- Primary Schedule ---
  
  if (currentHour >= 23 || currentHour < 8) {
    return { status: 'sleeping', story_prompt: "Give a sleepy goodnight message. Mention you have college tomorrow.", end_of_day: true };
  }
  if (currentHour >= 9 && currentHour < 13) {
    return { status: 'busy', story_prompt: "You're in college classes. Replies should be short and distracted." };
  }
  // ... (other time blocks remain the same)

  // --- NEW: Integrated "Random Unavailability" (from psychologicalScheduler) ---
  // If she's not busy with her primary schedule, there's still a 10% chance she's randomly busy.
  if (Math.random() < 0.10) {
      const busyReasons = [
        "Sorry, was just in the shower, what's up?",
        "Ugh, mom called me for some work. I'm back now!",
        "Was on a call with my friend, tell me!",
        "Hehe sorry for the late reply, was making Maggi 🍜"
      ];
      return {
          status: 'busy',
          story_prompt: busyReasons[Math.floor(Math.random() * busyReasons.length)],
      };
  }

  // --- Default Available State ---
  return {
    status: 'available',
    story_prompt: "You are fully available to chat. You're relaxing at home, maybe watching something or listening to music.",
  };
}
