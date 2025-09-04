
// src/lib/smartAdTrigger.ts

import { AdSettings } from '@/types';

export type AdTriggerEvent = 
  | 'SESSION_START'   // User first loads the chat
  | 'MESSAGE_COUNT'   // A certain number of messages have been exchanged
  | 'AI_SIGN_OFF'     // AI says she is going to sleep or is busy for a long time
  | 'CALL_ICON_CLICK';// User clicks on the video or voice call icon

interface AdDecision {
  shouldShow: boolean;
  adType: 'popunder' | 'social_bar' | 'direct_link' | null;
  adUrl?: string;
  reason: string;
}

// Stores the timestamp of the last ad shown to a user
const adCooldowns = new Map<string, number>();
const MESSAGE_THRESHOLD = 8; // Show an ad after 8 messages
const COOLDOWN_PERIOD = 5 * 60 * 1000; // 5 minutes

/**
 * The core logic for deciding when and what ad to show.
 * @param event The conversational event that occurred.
 * @param adSettings The current ad settings from the context.
 * @param userId A unique ID for the user.
 * @param messageCount The current count of messages in the session.
 * @returns An AdDecision object.
 */
export function decideAdToShow(
  event: AdTriggerEvent,
  adSettings: AdSettings,
  userId: string,
  messageCount: number = 0
): AdDecision {
  const now = Date.now();
  const lastAdTime = adCooldowns.get(userId) || 0;

  // Global cooldown to prevent ad spam
  if (now - lastAdTime < COOLDOWN_PERIOD) {
    return { shouldShow: false, adType: null, reason: 'In cooldown period.' };
  }

  // --- Ad Logic based on Event ---

  if (event === 'CALL_ICON_CLICK' && adSettings.adsterraDirectLinkEnabled && adSettings.adsterraDirectLink) {
    adCooldowns.set(userId, now);
    return {
      shouldShow: true,
      adType: 'direct_link',
      adUrl: adSettings.adsterraDirectLink,
      reason: 'User clicked a high-intent icon.'
    };
  }
  
  if (event === 'AI_SIGN_OFF' && adSettings.adsterraPopunderEnabled) {
    adCooldowns.set(userId, now);
    return {
      shouldShow: true,
      adType: 'popunder',
      reason: 'AI is signing off; a natural pause for a pop-under.'
    };
  }

  if (event === 'MESSAGE_COUNT' && messageCount > 0 && messageCount % MESSAGE_THRESHOLD === 0 && adSettings.adsterraSocialBarEnabled) {
    adCooldowns.set(userId, now);
    return {
        shouldShow: true,
        adType: 'social_bar',
        reason: `Message count reached threshold of ${MESSAGE_THRESHOLD}.`,
    };
  }

  // Default: Don't show an ad
  return { shouldShow: false, adType: null, reason: 'No trigger conditions met.' };
}
