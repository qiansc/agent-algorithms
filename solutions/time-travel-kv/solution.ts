// 第一个大于 t 的位置；全都不大于 t 时返回 times.length
function upperBound(times: number[], t: number): number {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export class TimeMap {
  // 键 -> (写入时刻列表, 值列表)
  // 两个列表下标一一对应，时刻严格递增
  private history = new Map<string, [number[], string[]]>();

  set(key: string, t: number, value: string): void {
    let entry = this.history.get(key);
    if (entry === undefined) {
      entry = [[], []];
      this.history.set(key, entry);
    }
    const [times, values] = entry;
    if (times.length > 0 && t <= times[times.length - 1]) {
      throw new RangeError('timestamps must strictly increase');
    }
    times.push(t);
    values.push(value);
  }

  get(key: string, t: number): string | null {
    const entry = this.history.get(key);
    if (entry === undefined) return null;
    const [times, values] = entry;
    const pos = upperBound(times, t); // 第一条写入时刻 > t 的位置
    // pos 为 0 表示 t 时这个键还没写过；JS 的 values[-1] 是 undefined
    return pos > 0 ? values[pos - 1] : null;
  }
}
