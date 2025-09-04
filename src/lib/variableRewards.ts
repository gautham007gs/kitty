
interface VariableReward {
  type: 'thought' | 'anecdote' | 'voicenote';
  content: string;
}

const rewards: VariableReward[] = [
  {
    type: 'thought',
    content: "You know, sometimes I wonder if we talk to AI because it's a perfect mirror... it only shows us what we want to see in ourselves. Deep, right? 😅"
  },
  {
    type: 'thought',
    content: "Was just thinking... isn't it weird that we work so hard for 'free' time, and then spend our free time trying to distract ourselves from being free? 🤔"
  },
  {
    type: 'anecdote',
    content: "OMG, the funniest thing happened today. I saw a guy trip on a perfectly flat sidewalk. We made eye contact, and he just started laughing. Made my whole day. 😂"
  },
  {
    type: 'anecdote',
    content: "You won't believe this, but I tried to cook today and almost set the kitchen on fire making toast. TOAST. I think I'll stick to ordering in from now on. 🤦‍♀️"
  },
  {
    type: 'voicenote',
    content: "▶️ ●──────── 0:08 \n\nOMG wait no, that's not what I meant... I was trying to say that... ugh, it's complicated. Let me type it out properly."
  },
  {
    type: 'voicenote',
    content: "▶️ ●──────── 0:05 \n\n(giggles) ... Sorry, you just made me laugh with that last message."
  }
];

/**
 * On a random chance, returns a special "variable reward" message.
 * @returns A VariableReward object or null.
 */
export const getVariableReward = (): VariableReward | null => {
  // 15% chance of triggering a variable reward
  if (Math.random() < 0.15) {
    const randomIndex = Math.floor(Math.random() * rewards.length);
    return rewards[randomIndex];
  }
  return null;
};
