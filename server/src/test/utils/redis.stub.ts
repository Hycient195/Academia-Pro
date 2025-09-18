// In-memory Redis stub for E2E tests to avoid external Redis dependency
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

type TValue = { value: string; expiresAt?: number };

@Injectable()
export class FakeRedisService implements OnModuleDestroy {
  private readonly logger = new Logger(FakeRedisService.name);

  // Simple in-memory stores
  private kv = new Map<string, TValue>();
  private hashes = new Map<string, Map<string, string>>();
  private sets = new Map<string, Set<string>>();
  private lists = new Map<string, string[]>();

  async onModuleDestroy() {
    this.kv.clear();
    this.hashes.clear();
    this.sets.clear();
    this.lists.clear();
    this.logger.log('FakeRedisService cleared in-memory state');
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    const hit = this.kv.get(key);
    if (!hit) return null;
    if (hit.expiresAt && Date.now() > hit.expiresAt) {
      this.kv.delete(key);
      return null;
    }
    return hit.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.kv.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.kv.delete(key);
    this.hashes.delete(key);
    this.sets.delete(key);
    this.lists.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.kv.has(key) || this.hashes.has(key) || this.sets.has(key) || this.lists.has(key);
  }

  // Hash operations
  private ensureHash(key: string): Map<string, string> {
    let h = this.hashes.get(key);
    if (!h) {
      h = new Map<string, string>();
      this.hashes.set(key, h);
    }
    return h;
  }

  async hget(key: string, field: string): Promise<string | null> {
    const h = this.hashes.get(key);
    if (!h) return null;
    return h.has(field) ? h.get(field)! : null;
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    const h = this.ensureHash(key);
    h.set(field, value);
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    const h = this.hashes.get(key);
    if (!h) return null;
    const out: Record<string, string> = {};
    for (const [k, v] of h.entries()) out[k] = v;
    return out;
  }

  async hdel(key: string, field: string): Promise<void> {
    const h = this.hashes.get(key);
    if (!h) return;
    h.delete(field);
    if (h.size === 0) this.hashes.delete(key);
  }

  // Set operations
  private ensureSet(key: string): Set<string> {
    let s = this.sets.get(key);
    if (!s) {
      s = new Set<string>();
      this.sets.set(key, s);
    }
    return s;
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    const s = this.ensureSet(key);
    for (const m of members) s.add(m);
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    const s = this.sets.get(key);
    if (!s) return;
    for (const m of members) s.delete(m);
    if (s.size === 0) this.sets.delete(key);
  }

  async smembers(key: string): Promise<string[]> {
    const s = this.sets.get(key);
    return s ? Array.from(s) : [];
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const s = this.sets.get(key);
    return s ? s.has(member) : false;
  }

  // List operations (minimal)
  private ensureList(key: string): string[] {
    let l = this.lists.get(key);
    if (!l) {
      l = [];
      this.lists.set(key, l);
    }
    return l;
  }

  async lpush(key: string, ...values: string[]): Promise<void> {
    const l = this.ensureList(key);
    l.unshift(...values);
  }

  async rpush(key: string, ...values: string[]): Promise<void> {
    const l = this.ensureList(key);
    l.push(...values);
  }

  async lrange(key: string, start: number, end: number): Promise<string[]> {
    const l = this.lists.get(key) || [];
    const last = end < 0 ? l.length + end : end;
    return l.slice(start, last + 1);
  }

  async lpop(key: string): Promise<string | null> {
    const l = this.lists.get(key);
    if (!l || l.length === 0) return null;
    return l.shift() ?? null;
  }

  // TTL / Keys
  async expire(key: string, seconds: number): Promise<void> {
    const hit = this.kv.get(key);
    if (hit) {
      hit.expiresAt = Date.now() + seconds * 1000;
      this.kv.set(key, hit);
    }
  }

  async ttl(key: string): Promise<number> {
    const hit = this.kv.get(key);
    if (!hit || !hit.expiresAt) return -1;
    const remain = Math.max(0, hit.expiresAt - Date.now());
    return Math.ceil(remain / 1000);
  }

  async keys(pattern: string): Promise<string[]> {
    // Only supports '*' suffix/prefix patterns minimally
    const toRegex = (p: string) =>
      new RegExp('^' + p.replace(/\*/g, '.*') + '$');
    const rx = toRegex(pattern);
    const pool = new Set<string>([
      ...this.kv.keys(),
      ...this.hashes.keys(),
      ...this.sets.keys(),
      ...this.lists.keys(),
    ]);
    return Array.from(pool).filter((k) => rx.test(k));
  }

  async flushdb(): Promise<void> {
    this.kv.clear();
    this.hashes.clear();
    this.sets.clear();
    this.lists.clear();
  }

  // JSON helpers
  async setJson(key: string, data: any, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(data), ttl);
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    const v = await this.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const ks = await this.keys(pattern);
    for (const k of ks) await this.del(k);
    this.logger.log(`FakeRedisService invalidated keys (${ks.length}) by pattern: ${pattern}`);
  }

  async ping(): Promise<boolean> {
    return true;
  }

  getClient(): any {
    return this; // compatibility noop
  }
}