export interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  get(key: string): Promise<RateLimitRecord | undefined>;
  set(key: string, record: RateLimitRecord): Promise<void>;
  clear(): Promise<void>;
}

class MemoryStore implements RateLimitStore {
  private store = new Map<string, RateLimitRecord>();
  async get(key: string) {
    return this.store.get(key);
  }
  async set(key: string, record: RateLimitRecord) {
    this.store.set(key, record);
  }
  async clear() {
    this.store.clear();
  }
}

export const memoryStore = new MemoryStore();
