import { Injectable } from '@nestjs/common';

interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresAt: Date;
}

@Injectable()
export class ReportCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached report data
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached report data
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const now = new Date();
    const ttl = ttlMs || this.DEFAULT_TTL_MS;
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: new Date(now.getTime() + ttl),
    });
  }

  /**
   * Delete cached report data
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached reports
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key for user balance
   */
  getUserBalanceCacheKey(userId: string, asOfDate: Date): string {
    return `user_balance:${userId}:${asOfDate.toISOString()}`;
  }

  /**
   * Generate cache key for subscription balance
   */
  getSubscriptionBalanceCacheKey(subscriptionId: string, asOfDate: Date): string {
    return `subscription_balance:${subscriptionId}:${asOfDate.toISOString()}`;
  }

  /**
   * Generate cache key for all balances
   */
  getAllBalancesCacheKey(asOfDate: Date): string {
    return `all_balances:${asOfDate.toISOString()}`;
  }

  /**
   * Invalidate cache for a specific user
   */
  invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`user_balance:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate cache for a specific subscription
   */
  invalidateSubscriptionCache(subscriptionId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`subscription_balance:${subscriptionId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate all balance caches
   */
  invalidateAllBalanceCaches(): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith('all_balances:')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

