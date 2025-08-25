
const USER_MESSAGE_COUNT_KEY = 'kruthika_user_message_count';
const USER_MESSAGE_LIMIT_KEY = 'kruthika_user_message_limit';
const USER_MESSAGE_DATE_KEY = 'kruthika_user_message_date';

const DEFAULT_MESSAGE_LIMIT = 50; // Daily message limit

export const userPersonalization = {
  getMessageCount(): number {
    if (typeof window === 'undefined') return 0;
    
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem(USER_MESSAGE_DATE_KEY);
    
    // Reset count if it's a new day
    if (lastDate !== today) {
      localStorage.setItem(USER_MESSAGE_COUNT_KEY, '0');
      localStorage.setItem(USER_MESSAGE_DATE_KEY, today);
      return 0;
    }
    
    const count = parseInt(localStorage.getItem(USER_MESSAGE_COUNT_KEY) || '0', 10);
    return count;
  },

  getMessageLimit(): number {
    if (typeof window === 'undefined') return DEFAULT_MESSAGE_LIMIT;
    
    const limit = parseInt(localStorage.getItem(USER_MESSAGE_LIMIT_KEY) || DEFAULT_MESSAGE_LIMIT.toString(), 10);
    return limit;
  },

  incrementMessageCount(): void {
    if (typeof window === 'undefined') return;
    
    const currentCount = this.getMessageCount();
    const newCount = currentCount + 1;
    localStorage.setItem(USER_MESSAGE_COUNT_KEY, newCount.toString());
    localStorage.setItem(USER_MESSAGE_DATE_KEY, new Date().toDateString());
  },

  setMessageLimit(limit: number): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(USER_MESSAGE_LIMIT_KEY, limit.toString());
  },

  resetDailyCount(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(USER_MESSAGE_COUNT_KEY, '0');
    localStorage.setItem(USER_MESSAGE_DATE_KEY, new Date().toDateString());
  }
};
