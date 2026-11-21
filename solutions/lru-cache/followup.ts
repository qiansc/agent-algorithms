export class LRUCacheShort {
  private capacity: number;
  // Map 按插入顺序遍历，最旧的在最前
  private data = new Map<string, number>();

  constructor(capacity: number) {
    if (capacity < 0) throw new RangeError('capacity must be >= 0');
    this.capacity = capacity;
  }

  get(key: string): number | null {
    if (!this.data.has(key)) return null;
    const value = this.data.get(key)!;
    this.data.delete(key); // 先删再插，才会排到最后
    this.data.set(key, value);
    return value;
  }

  put(key: string, value: number): void {
    this.data.delete(key); // 只 set 一个已有的键，位置不会变
    this.data.set(key, value);
    if (this.data.size > this.capacity) {
      const oldest = this.data.keys().next().value!;
      this.data.delete(oldest);
    }
  }
}
