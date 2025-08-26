import { supabase } from './supabaseClient';

// Connection pool and query optimization utilities
class SupabaseOptimizer {
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private adCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly AD_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for ads

  // Optimized batch message insertion
  async batchInsertMessages(messages: Array<{
    session_id: string;
    user_id?: string;
    message_type: 'user' | 'ai';
    message_content: string;
    chat_id: string;
  }>) {
    if (!supabase || messages.length === 0) return;

    try {
      // Use upsert for better performance
      const { error } = await supabase
        .from('messages_log')
        .upsert(messages, {
          onConflict: 'session_id,timestamp',
          ignoreDuplicates: true
        });

      if (error) console.error('Batch insert error:', error);
    } catch (error) {
      console.error('Batch message insert failed:', error);
    }
  }

  // Cached query execution
  async cachedQuery<T>(
    cacheKey: string,
    queryFn: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    // Check cache first
    const cached = this.queryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }

    // Execute query
    const { data, error } = await queryFn();
    if (error) {
      console.error('Cached query error:', error);
      return null;
    }

    // Cache result
    this.queryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  // Optimized daily activity logging with conflict resolution
  async logDailyActivity(userId?: string, sessionId = 'anonymous', chatId = 'default_chat') {
    if (!supabase) return;

    try {
      // Use stored procedure for atomic operation
      const { error } = await supabase.rpc('log_daily_activity', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_chat_id: chatId
      });

      if (error) console.error('Daily activity log error:', error);
    } catch (error) {
      console.error('Daily activity logging failed:', error);
    }
  }

  // Get user stats with caching
  async getUserStats(userId: string) {
    return this.cachedQuery(`user_stats_${userId}`, async () => {
      if (!supabase) return { data: null, error: 'No Supabase client' };

      return supabase
        .from('daily_activity_log')
        .select('date, activity_count')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);
    });
  }

  // Clear cache manually
  clearCache() {
    this.queryCache.clear();
    this.adCache.clear();
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.queryCache.size,
      keys: Array.from(this.queryCache.keys())
    };
  }

  // Get ad performance data with aggressive caching
  async getAdPerformanceData(adProvider: string, params: any) {
    const cacheKey = `${adProvider}_${JSON.stringify(params)}`;
    const cached = this.adCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.AD_CACHE_DURATION) {
      return cached.data;
    }

    let data = null;
    let error = null;

    // Placeholder for actual ad data fetching logic based on provider
    if (adProvider === 'adsterra') {
      // Example: Fetch Adsterra data
      // const response = await fetch('/api/adsterra', { method: 'POST', body: JSON.stringify(params) });
      // const result = await response.json();
      // data = result.data;
      // error = result.error;
      console.log(`Fetching Adsterra data with params: ${JSON.stringify(params)}`);
      data = { totalRevenue: 100, clicks: 50, impressions: 1000 }; // Mock data
      error = null;
    } else if (adProvider === 'monetag') {
      // Example: Fetch Monetag data
      // const response = await fetch('/api/monetag', { method: 'POST', body: JSON.stringify(params) });
      // const result = await response.json();
      // data = result.data;
      // error = result.error;
      console.log(`Fetching Monetag data with params: ${JSON.stringify(params)}`);
      data = { totalRevenue: 120, clicks: 60, impressions: 1200 }; // Mock data
      error = null;
    } else {
      error = 'Unsupported ad provider';
    }

    if (error) {
      console.error(`Ad data fetch error for ${adProvider}:`, error);
      return null;
    }

    this.adCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    return data;
  }
}

export const supabaseOptimizer = new SupabaseOptimizer();