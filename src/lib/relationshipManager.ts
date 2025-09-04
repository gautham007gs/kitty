
export enum RelationshipStage {
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  CLOSE = 'close',
  INTIMATE = 'intimate',
}

interface RelationshipState {
  stage: RelationshipStage;
  interactionCount: number;
  lastInteractionTimestamp: number; // Unix timestamp in milliseconds
  cumulativeSentimentScore: number; // A running total of sentiment from user messages
}

// In a real application, this would be persisted in a database.
// For now, we'll use a simple in-memory map.
const userRelationshipStates = new Map<string, RelationshipState>();

/**
 * Initializes or retrieves the relationship state for a given user.
 * @param userId The ID of the user.
 * @returns The current relationship state.
 */
export const getRelationshipState = (userId: string): RelationshipState => {
  if (!userRelationshipStates.has(userId)) {
    userRelationshipStates.set(userId, {
      stage: RelationshipStage.CASUAL,
      interactionCount: 0,
      lastInteractionTimestamp: Date.now(),
      cumulativeSentimentScore: 0,
    });
  }
  return userRelationshipStates.get(userId)!;
};

/**
 * Updates the relationship state based on user interactions and sentiment.
 * @param userId The ID of the user.
 * @param sentimentScore The sentiment score of the latest user message (e.g., -1 to 1).
 * @param incrementInteraction If true, increments the interaction count.
 * @returns The updated relationship state.
 */
export const updateRelationshipState = (
  userId: string,
  sentimentScore: number = 0, // Default to neutral sentiment if not provided
  incrementInteraction: boolean = true
): RelationshipState => {
  const currentState = getRelationshipState(userId);
  const now = Date.now();

  // Calculate time since last interaction for potential relationship decay or acknowledgment
  const timeSinceLastInteraction = now - currentState.lastInteractionTimestamp;

  if (incrementInteraction) {
    currentState.interactionCount++;
    currentState.cumulativeSentimentScore += sentimentScore;
    currentState.lastInteractionTimestamp = now;
  }

  // Normalize cumulative sentiment to avoid unbounded growth or decay
  // This is a simple normalization; more complex decay models could be used.
  currentState.cumulativeSentimentScore = Math.max(-100, Math.min(100, currentState.cumulativeSentimentScore));

  // Logic to transition between stages based on interactionCount and cumulativeSentimentScore
  // Also consider faster progression with positive sentiment
  if (currentState.stage === RelationshipStage.CLOSE) {
    if (currentState.interactionCount >= 50 || currentState.cumulativeSentimentScore >= 30) {
      currentState.stage = RelationshipStage.INTIMATE;
      console.log(`💖 User ${userId} transitioned to INTIMATE stage!`);
    }
  } else if (currentState.stage === RelationshipStage.FRIENDLY) {
    if (currentState.interactionCount >= 20 || currentState.cumulativeSentimentScore >= 10) {
      currentState.stage = RelationshipStage.CLOSE;
      console.log(`🥰 User ${userId} transitioned to CLOSE stage!`);
    }
  } else if (currentState.stage === RelationshipStage.CASUAL) {
    if (currentState.interactionCount >= 5 || currentState.cumulativeSentimentScore >= 3) {
      currentState.stage = RelationshipStage.FRIENDLY;
      console.log(`😊 User ${userId} transitioned to FRIENDLY stage!`);
    }
  }

  userRelationshipStates.set(userId, currentState);
  return currentState;
};

/**
 * Provides conversational hooks specific to the current relationship stage.
 * These can be used to influence the AI's responses.
 * @param stage The current relationship stage.
 * @param timeSinceLastInteraction Milliseconds since the last interaction (optional, for recency hooks).
 * @returns An array of string hooks.
 */
export const getRelationshipSpecificHooks = (stage: RelationshipStage, timeSinceLastInteraction?: number): string[] => {
  const hooks: string[] = [];

  if (timeSinceLastInteraction !== undefined) {
    const daysSinceLastInteraction = timeSinceLastInteraction / (1000 * 60 * 60 * 24);
    if (daysSinceLastInteraction >= 7) {
      hooks.push("(Acknowledge long absence: 'Long time no see!')");
    } else if (daysSinceLastInteraction >= 1) {
      hooks.push("(Acknowledge recent absence: 'missed you!')");
    }
  }

  switch (stage) {
    case RelationshipStage.CASUAL:
      hooks.push("(Keep it light and friendly)", "(Focus on general topics)", "(Don't be too forward)");
      break;
    case RelationshipStage.FRIENDLY:
      hooks.push("(Share a bit more personal info)", "(Use some playful teasing)", "(Show more interest in their day)");
      break;
    case RelationshipStage.CLOSE:
      hooks.push("(Be more vulnerable and open)", "(Use terms of endearment naturally)", "(Hint at deeper connection)");
      break;
    case RelationshipStage.INTIMATE:
      hooks.push("(Express deep emotional connection)", "(Use very personal and exclusive language)", "(Suggest future shared experiences)", "(Be very supportive and understanding)");
      break;
  }
  return hooks;
};
