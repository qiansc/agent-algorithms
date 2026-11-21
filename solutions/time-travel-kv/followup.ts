// 第一个 >= t 的位置
function lowerBound(times: number[], t: number): number {
  let lo = 0;
  let hi = times.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// 第一个 > t 的位置
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

// 写入时刻可以乱序；同一键同一时刻再次写入时覆盖旧值。
export class TimeMapAnyOrder {
  private history = new Map<string, [number[], string[]]>();

  set(key: string, t: number, value: string): void {
    let entry = this.history.get(key);
    if (entry === undefined) {
      entry = [[], []];
      this.history.set(key, entry);
    }
    const [times, values] = entry;
    const pos = lowerBound(times, t); // 插到这里，数组仍然有序
    if (pos < times.length && times[pos] === t) {
      values[pos] = value;
    } else {
      times.splice(pos, 0, t); // 后面的元素整体后移，O(m)
      values.splice(pos, 0, value);
    }
  }

  get(key: string, t: number): string | null {
    const entry = this.history.get(key);
    if (entry === undefined) return null;
    const [times, values] = entry;
    const pos = upperBound(times, t);
    return pos > 0 ? values[pos - 1] : null;
  }
}
