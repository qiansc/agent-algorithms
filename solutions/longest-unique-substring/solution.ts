export function longestUnique(s: string): number {
  const last = new Map<string, number>(); // 字符 -> 它最近一次出现的下标
  let left = 0; // 窗口是 chars[left..right]
  let best = 0;
  const chars = Array.from(s); // 按 Unicode 码点切开，emoji 不会被拆成两半
  chars.forEach((ch, right) => {
    // 上一个 ch 若还在窗口里，左边界跳到它后面一格；已经在窗口外就不动
    left = Math.max(left, (last.get(ch) ?? -1) + 1);
    best = Math.max(best, right - left + 1);
    last.set(ch, right);
  });
  return best;
}
