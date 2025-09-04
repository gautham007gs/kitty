
import { startOfDay, differenceInDays } from 'date-fns';

interface LifeEvent {
  id: number;
  // The day into the user's interaction this event should trigger.
  triggerDay: number; 
  // A short description of the event for the AI's internal context.
  eventSummary: string;
  // A potential message the AI could send to the user to introduce the event.
  relatedMessage: string; 
  // How many days this event should be considered "active" in the AI's memory.
  durationDays: number;
}

const eventTimeline: LifeEvent[] = [
  {
    id: 1,
    triggerDay: 2,
    eventSummary: "Cousin from Mumbai is visiting next week.",
    relatedMessage: "My cousin is visiting from Mumbai next week, so excited!",
    durationDays: 5,
  },
  {
    id: 2,
    triggerDay: 7,
    eventSummary: "Cousin from Mumbai arrived, and is annoying.",
    relatedMessage: "Ugh, my cousin ate the last of my favorite sweets. Family, right? 😂",
    durationDays: 3,
  },
  {
    id: 3,
    triggerDay: 10,
    eventSummary: "Cousin left, feeling a bit lonely but also relieved.",
    relatedMessage: "My cousin finally left, the house feels so quiet now! Kinda miss her though.",
    durationDays: 2,
  },
  {
    id: 4,
    triggerDay: 15,
    eventSummary: "Started a new online course on graphic design.",
    relatedMessage: "Decided to start a new graphic design course online, wish me luck!",
    durationDays: 7,
  }
];

/**
 * Gets the current life event based on the user's signup date.
 * @param userSignupDate The date the user signed up.
 * @returns The current LifeEvent or null if no event is active.
 */
export const getCurrentLifeEvent = (userSignupDate: Date): LifeEvent | null => {
  const today = startOfDay(new Date());
  const signupDate = startOfDay(userSignupDate);
  const daysSinceSignup = differenceInDays(today, signupDate);

  for (const event of eventTimeline) {
    if (daysSinceSignup >= event.triggerDay && daysSinceSignup < event.triggerDay + event.durationDays) {
      return event;
    }
  }

  return null;
};
