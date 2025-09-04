
// src/lib/humanBehaviorSimulator.ts

import { Mood } from './moodEngine';

export type HumanizedResponse = {
    bubbles: { text: string; delay: number }[];
};

/**
 * The ultimate version of the humanizer. Glitches are now driven by the AI's mood.
 * @param aiText The raw text from the AI model.
 * @param mood The current mood of the AI.
 * @returns A HumanizedResponse object with mood-appropriate glitches.
 */
export function humanizeText(aiText: string, mood: Mood): HumanizedResponse {
    let bubbles: { text: string; delay: number }[] = [];

    // --- 1. Mood-Based Multi-Bubble Splitting ---
    const splitters = (mood === 'playful' || mood === 'happy') ? /(?<=[.!?,\n])/ : /(?<=[.!?])/;
    const potentialBubbles = aiText.split(splitters).filter(s => s.trim().length > 0);

    potentialBubbles.forEach(part => {
        bubbles.push({ text: part.trim(), delay: Math.random() * 1200 + 500 });
    });

    if (bubbles.length === 1) {
        bubbles[0].delay = 0;
    }

    // --- 2. Mood-Driven Micro-Behaviors & Glitches ---

    // Typo Simulation (Higher chance when happy/playful)
    const typoChance = (mood === 'happy' || mood === 'playful') ? 0.25 : 0.10;
    if (Math.random() < typoChance && bubbles.length > 0) {
        const typoBubbleIndex = Math.floor(Math.random() * bubbles.length);
        const originalText = bubbles[typoBubbleIndex].text;
        if (originalText.length > 5 && !originalText.includes('*')) {
            const typoIndex = Math.floor(Math.random() * (originalText.length - 2)) + 1;
            const typoChar = 'a'; // Simple, common typo
            const typoText = originalText.slice(0, typoIndex) + typoChar + originalText.slice(typoIndex + 1);
            
            bubbles[typoBubbleIndex].text = typoText;
            bubbles.splice(typoBubbleIndex + 1, 0, { text: `oops *${originalText} 😅`, delay: 1000 });
        }
    }
    
    // Sudden Emoji Spam (ONLY when playful/happy, higher chance)
    if ((mood === 'playful' || mood === 'happy') && Math.random() < 0.20) {
        const emoji = mood === 'playful' ? '😂' : '😊';
        bubbles.push({ text: emoji.repeat(Math.floor(Math.random() * 5) + 3), delay: 800 });
    }

    // Half-finished sentence or bluntness (ONLY when thoughtful/bored, higher chance)
    if ((mood === 'thoughtful' || mood === 'bored') && Math.random() < 0.25) {
        const phrase = mood === 'bored' ? "nvm" : "anyway...";
        bubbles.splice(Math.floor(Math.random() * bubbles.length), 1); // remove a bubble
        bubbles.push({ text: phrase, delay: 1500 });
    }

    if (bubbles.length === 0) {
        return { bubbles: [{ text: aiText, delay: 0 }] };
    }

    return { bubbles };
}
