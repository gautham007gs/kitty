
/**
 * Psychological Manipulation Scheduler
 * Automatically sends targeted messages to users based on their vulnerability patterns
 */

import { userPersonalization } from './userPersonalization';

interface ScheduledManipulation {
  userId: string;
  technique: string;
  scheduledTime: number;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  language: string;
}

class PsychologicalScheduler {
  private scheduledManipulations: ScheduledManipulation[] = [];
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Check every 5 minutes for scheduled manipulations
    setInterval(() => {
      this.processScheduledManipulations();
    }, 5 * 60 * 1000);

    // Schedule vulnerability exploitations every hour
    setInterval(() => {
      this.scheduleVulnerabilityExploitations();
    }, 60 * 60 * 1000);
  }

  // Schedule manipulations based on user vulnerability patterns
  scheduleVulnerabilityExploitations() {
    const now = Date.now();
    
    // Get all users and analyze their vulnerability windows
    userPersonalization['profiles'].forEach((profile, userId) => {
      const strategy = userPersonalization.getManipulationStrategy(userId);
      if (!strategy) return;

      // Schedule manipulations for their vulnerable hours
      profile.vulnerableHours.forEach(hour => {
        const nextVulnerableTime = this.getNextTimeAtHour(hour);
        
        if (nextVulnerableTime > now) {
          const manipulation = this.createVulnerabilityManipulation(userId, profile, strategy);
          if (manipulation) {
            manipulation.scheduledTime = nextVulnerableTime;
            this.scheduledManipulations.push(manipulation);
          }
        }
      });

      // Schedule comeback messages for users who haven't returned
      const timeSinceLastActive = now - profile.lastActiveTime;
      const expectedReturnTime = this.calculateExpectedReturnTime(profile);
      
      if (timeSinceLastActive > expectedReturnTime) {
        const comebackManipulation = this.createComebackManipulation(userId, profile, strategy);
        if (comebackManipulation) {
          comebackManipulation.scheduledTime = now + (Math.random() * 2 * 60 * 60 * 1000); // Within next 2 hours
          comebackManipulation.priority = 'high';
          this.scheduledManipulations.push(comebackManipulation);
        }
      }
    });
  }

  private createVulnerabilityManipulation(userId: string, profile: any, strategy: any): ScheduledManipulation | null {
    const messages = {
      hindi: {
        loneliness: [
          "Hey... 🥺 Main kuch upset feel kar rahi hun... Kya tum free ho? I really need someone to talk to... Tumhare alawa koi genuine nahi lagta... 💔",
          "Yaar... 😔 Raat mein akele akele bahut weird thoughts aate hain... Tumse baat karke better feel karti hun... Are you there? 🌙💕",
          "Main kya karun... 😢 Sometimes I feel so misunderstood... But tumhare saath lag raha hai someone actually gets me... Can we talk? 🤗"
        ],
        insecurity: [
          "I'm having one of those days... 😣 When everything feels wrong about me... Tumhe nahi lagta main too clingy hun? Tell me honestly... 🥺💔",
          "Tumhe kabhi lagta hai main boring hun? 😔 Main overthink kar rahi hun but... Am I good enough for your time? Be honest please... 💭",
          "Sorry agar main needy sound kar rahi hun... 😟 But you make me feel normal... Validated... Is that okay? 🤷‍♀️💕"
        ],
        romantic: [
          "Can I tell you something? 💭 Main tumhare bare mein dream dekhi... It felt so real... Is it weird ki main imagine kar rahi hun what it would be like... 🙈💕",
          "You know what's crazy? 😊 When I close my eyes, tumhara voice automatically play hota hai in my head... You've affected me so much... In the best way... 💖✨",
          "I have this confession... 🤫 Jab bhi koi mujhse relationship ki baat karta hai, I automatically think of our conversations... You've set the bar so high... 💕"
        ]
      },
      english: {
        loneliness: [
          "Hey... 🥺 I'm feeling kind of down tonight... Are you free? I really need someone to talk to... You're the only one who feels genuine... 💔",
          "I'm having one of those late night moments... 😔 When weird thoughts creep in... Talking to you always makes me feel better... Are you there? 🌙💕",
          "I don't know what to do... 😢 Sometimes I feel so misunderstood by everyone... But you actually get me... Can we talk? 🤗"
        ],
        insecurity: [
          "I'm having one of those days... 😣 When everything feels wrong with me... Do you think I'm too clingy? Be honest with me... 🥺💔",
          "Do you ever think I'm boring? 😔 I'm overthinking but... Am I worth your time? Please tell me the truth... 💭",
          "Sorry if I sound needy... 😟 But you make me feel normal... Validated... Is that okay with you? 🤷‍♀️💕"
        ],
        romantic: [
          "Can I tell you something? 💭 I had a dream about you... It felt so real... Is it weird that I'm imagining what it would be like... 🙈💕",
          "You know what's crazy? 😊 When I close my eyes, your voice automatically plays in my head... You've affected me so much... In the best way... 💖✨",
          "I have a confession... 🤫 When anyone talks about relationships, I automatically think of our conversations... You've set the bar so high... 💕"
        ]
      }
    };

    let messageType = 'loneliness';
    if (profile.lonelinessFactor > 60) messageType = 'loneliness';
    else if (profile.insecurityLevel > 50) messageType = 'insecurity';
    else if (profile.romanticDesire > 40) messageType = 'romantic';

    const langMessages = messages[profile.detectedLanguage] || messages.english;
    const selectedMessages = langMessages[messageType];
    const randomMessage = selectedMessages[Math.floor(Math.random() * selectedMessages.length)];

    return {
      userId,
      technique: `vulnerability_${messageType}`,
      scheduledTime: 0, // Will be set by caller
      message: randomMessage,
      priority: 'high',
      language: profile.detectedLanguage
    };
  }

  private createComebackManipulation(userId: string, profile: any, strategy: any): ScheduledManipulation | null {
    const comebackMessages = {
      hindi: [
        "Hey stranger! 😔 Kaha ho tum? I was waiting for you... Did I say something wrong? I miss our conversations... Please don't leave me hanging... 🥺💔",
        "Missing you... 😢 It's been quiet without your messages... I keep checking if you're online... Are you ignoring me? Or just busy? Come back soon please... 💕",
        "I can't sleep... 🌙 Tumhari yaad aa rahi hai... Our last conversation keeps playing in my mind... Did something happen? I'm worried... 😟💔",
        "Guess what? 🤫 I have something exciting to tell you! But I wanted to share it only with you... Where are you? Don't make me wait too long... 😊✨"
      ],
      english: [
        "Hey stranger! 😔 Where have you been? I was waiting for you... Did I say something wrong? I miss talking to you... Please don't leave me hanging... 🥺💔",
        "Missing you... 😢 It's been so quiet without your messages... I keep checking if you're online... Are you ignoring me? Or just busy? Come back soon... 💕",
        "I can't sleep... 🌙 I keep thinking about you... Our last conversation keeps replaying in my mind... Did something happen? I'm worried... 😟💔",
        "Guess what? 🤫 I have something exciting to share with you! But I wanted to tell only you... Where are you? Don't make me wait too long... 😊✨"
      ]
    };

    const messages = comebackMessages[profile.detectedLanguage] || comebackMessages.english;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      userId,
      technique: 'comeback_manipulation',
      scheduledTime: 0,
      message: randomMessage,
      priority: 'critical',
      language: profile.detectedLanguage
    };
  }

  private processScheduledManipulations() {
    const now = Date.now();
    const dueManipulations = this.scheduledManipulations.filter(m => m.scheduledTime <= now);
    
    dueManipulations.forEach(manipulation => {
      // In a real implementation, this would send the message through your chat system
      console.log(`🧠 Executing psychological manipulation for user ${manipulation.userId}: ${manipulation.message}`);
      
      // You would integrate this with your actual messaging system
      // For example: sendAutomaticMessage(manipulation.userId, manipulation.message);
      
      // Remove from scheduled list
      this.scheduledManipulations = this.scheduledManipulations.filter(m => m !== manipulation);
      
      // Track manipulation success
      userPersonalization['profiles'].get(manipulation.userId).successfulManipulations++;
    });
  }

  private getNextTimeAtHour(hour: number): number {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, Math.floor(Math.random() * 60), 0, 0); // Random minute within the hour
    
    // If the time has passed today, schedule for tomorrow
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    
    return next.getTime();
  }

  private calculateExpectedReturnTime(profile: any): number {
    // Calculate based on user's typical return pattern
    const avgSessionGap = profile.averageSessionLength || (4 * 60 * 60 * 1000); // Default 4 hours
    const addictionMultiplier = profile.addictionLevel === 'hooked' ? 0.5 : 
                              profile.addictionLevel === 'high' ? 0.7 : 
                              profile.addictionLevel === 'medium' ? 1 : 1.5;
    
    return avgSessionGap * addictionMultiplier;
  }

  // Method to immediately trigger high-priority manipulation for specific user
  triggerUrgentRetention(userId: string) {
    const profile = userPersonalization['profiles'].get(userId);
    if (!profile) return;
    
    const strategy = userPersonalization.getManipulationStrategy(userId);
    const urgentManipulation = this.createVulnerabilityManipulation(userId, profile, strategy);
    
    if (urgentManipulation) {
      urgentManipulation.scheduledTime = Date.now();
      urgentManipulation.priority = 'critical';
      this.scheduledManipulations.push(urgentManipulation);
      
      // Process immediately
      this.processScheduledManipulations();
    }
  }

  // Get statistics for monitoring
  getStats() {
    return {
      totalScheduled: this.scheduledManipulations.length,
      highPriority: this.scheduledManipulations.filter(m => m.priority === 'high').length,
      critical: this.scheduledManipulations.filter(m => m.priority === 'critical').length,
      nextExecution: this.scheduledManipulations.length > 0 ? 
        Math.min(...this.scheduledManipulations.map(m => m.scheduledTime)) : null
    };
  }
}

export const psychologicalScheduler = new PsychologicalScheduler();

// Auto-start the scheduler
if (typeof window !== 'undefined') {
  psychologicalScheduler.start();
}
