// 长期偏好：用户明说的直接记；从行为里推断的要攒够证据，并且会过期。
// 时间用“第几天”的整数表示，方便测试。

const INFER_AFTER = 3; // 同一个值连续出现 3 次才算偏好
const WINDOW_DAYS = 30; // 只看最近 30 天的观察
const INFERRED_TTL = 60; // 推断出的偏好，60 天没有新证据就失效

export class PreferenceStore {
  // key -> [值, 写入日, 有效天数；null 表示一直有效]
  explicit = new Map<string, [string, number, number | null]>();
  // key -> [值, 最近一次支持它的观察日]
  inferred = new Map<string, [string, number]>();
  history = new Map<string, [number, string][]>();

  // 用户明确说的，例如“我乳糖不耐”“这周送到酒店”
  tell(key: string, value: string, day: number,
    ttlDays: number | null = null): void {
    if (ttlDays !== null && ttlDays < 1) {
      throw new Error('ttlDays must be >= 1');
    }
    this.explicit.set(key, [value, day, ttlDays]);
  }

  // 从一笔订单里看到的选择。返回推断偏好现在是否就是这个值
  observe(key: string, value: string, day: number): boolean {
    const all = [...(this.history.get(key) ?? []), [day, value]] as
      [number, string][];
    // 只留最近 30 天的观察
    const seen = all.filter(([d]) => day - d < WINDOW_DAYS);
    this.history.set(key, seen);
    const recent = seen.slice(-INFER_AFTER).map(([, v]) => v);
    const current = this.inferred.get(key);
    if (recent.length === INFER_AFTER && new Set(recent).size === 1) {
      this.inferred.set(key, [value, day]);
    } else if (current && current[0] !== value) {
      this.inferred.delete(key); // 出现了相反的证据，推断作废
    }
    return this.inferred.get(key)?.[0] === value;
  }

  private explicitAlive(key: string, day: number): string | null {
    const hit = this.explicit.get(key);
    if (!hit) return null;
    const [value, since, ttl] = hit;
    if (ttl !== null && day >= since + ttl) return null;
    return value;
  }

  private inferredAlive(key: string, day: number): string | null {
    const hit = this.inferred.get(key);
    if (!hit) return null;
    const [value, last] = hit;
    return day - last <= INFERRED_TTL ? value : null;
  }

  get(key: string, day: number): string | null {
    // 明说的优先于推断的
    const told = this.explicitAlive(key, day);
    if (told !== null) return told;
    return this.inferredAlive(key, day);
  }

  // 用户说“忘掉”：明说的、推断的、观察记录一起删
  forget(key: string): boolean {
    let removed = false;
    const tables = [this.explicit, this.inferred, this.history];
    for (const table of tables) {
      if (table.delete(key)) removed = true;
    }
    return removed;
  }

  // 当前生效的偏好及来源，给“我的偏好”页面和提示词用
  visible(day: number): Record<string, [string, string]> {
    const out: Record<string, [string, string]> = {};
    const keys = [...new Set([...this.explicit.keys(),
      ...this.inferred.keys()])].sort();
    for (const key of keys) {
      const told = this.explicitAlive(key, day);
      if (told !== null) {
        out[key] = [told, 'explicit'];
        continue;
      }
      const guess = this.inferredAlive(key, day);
      if (guess !== null) out[key] = [guess, 'inferred'];
    }
    return out;
  }
}
