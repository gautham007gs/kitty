
import { generateAIResponse } from './aiService';

/**
 * A service responsible for proactively re-engaging users.
 */
class ReengagementService {

  /**
   * Generates a personalized, AI-powered message to re-engage a user.
   *
   * @param userId The ID of the user to re-engage.
   * @returns The generated re-engagement message.
   */
  async generateReengagementMessage(userId: string): Promise<string> {
    console.log(`💡 Initiating proactive re-engagement for user: ${userId}`);

    // This is the special internal "prompt" that tells the AI *what* to do.
    const internalPrompt = "It's been a little quiet. I should send a friendly, casual message to see how they are.";

    try {
      const aiResponse = await generateAIResponse(internalPrompt, userId);
      const reengagementMessage = aiResponse.messages.join(' \n');
      
      console.log(`📤 Generated re-engagement message for ${userId}: "${reengagementMessage}"`);
      
      // In a real application, this message would be sent via a push notification.
      return reengagementMessage;

    } catch (error) {
      console.error(`❌ Failed to generate re-engagement message for ${userId}:`, error);
      // Return a safe fallback message
      return "Hey, just checking in! How have you been?";
    }
  }
}

export const reengagementService = new ReengagementService();
