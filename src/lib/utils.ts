import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the app is likely running inside the Instagram in-app browser.
 * This is based on a common user-agent string pattern.
 * @returns {boolean} True if likely in Instagram's in-app browser, false otherwise.
 */
export function isRunningInInstagramApp(): boolean {
  if (typeof window !== 'undefined' && window.navigator) {
    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
    // Instagram's user agent string often contains "Instagram"
    if (/instagram/i.test(userAgent)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks if the current device is likely Android.
 * @returns {boolean} True if likely an Android device, false otherwise.
 */
export function isAndroid(): boolean {
  if (typeof window !== 'undefined' && window.navigator) {
    const userAgent = window.navigator.userAgent;
    return /android/i.test(userAgent);
  }
  return false;
}

// Helper for Indian-style fallback responses
export function getIndianFallbackResponse(userMsg: string): string {
  const msg = userMsg.toLowerCase();

  // Greeting responses
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('namaste')) {
    return Math.random() > 0.5 ?
      "Hii! Sorry network issue tha... Kaise ho? 😊" :
      "Hello ji! Connection problem thi, ab theek hai! ✨";
  }

  // Question responses
  if (msg.includes('?') || msg.includes('kya') || msg.includes('how') || msg.includes('what')) {
    return Math.random() > 0.5 ?
      "Arre wait! Internet slow chal rahi, phir se pucho na? 🤔" :
      "Oops! Technical issue... Question repeat kar do please? 💭";
  }

  // Love/romantic context
  if (msg.includes('love') || msg.includes('pyaar') || msg.includes('miss') || msg.includes('beautiful')) {
    return Math.random() > 0.5 ?
      "Aww! Server down tha... Tumhara message miss ho gaya, again bolo na? 💕" :
      "Sorry sweetheart! Network problem... Kya keh rahe the? 🥰";
  }

  // Casual conversation
  if (msg.includes('kaise') || msg.includes('kaisi') || msg.includes('how are')) {
    return Math.random() > 0.5 ?
      "Main thik hun! Sorry connection issue tha... Tum kaise ho? 😌" :
      "Bas network slow thi! Ab sab theek... Tumhara din kaisa gaya? ✨";
  }

  // Default responses with variety
  const defaultResponses = [
    "Arre yaar! Technical problem aa gayi thi... Phir se bolo na? 😅",
    "Sorry babu! Internet slow chal rahi... Repeat karo please? 🙈",
    "Oops! Server down tha... Tumhara message miss ho gaya! 😊",
    "Connection issue thi! Ab theek hai, bolo kya kehna tha? 💭",
    "Technical glitch hui thi! Now I'm back... Kya bol rahe the? ✨",
    "Network problem thi yaar! Phir se message bhejo na? 🌸",
    "Sorry! Server restart ho raha tha... Again try karo? 💕"
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}
