export function largestBelow(n: number, digits: number[]): number {
  if (!Number.isSafeInteger(n) || n < 1) {
    throw new RangeError('n must be a positive integer');
  }
  const ds = [...new Set(digits)].sort((x, y) => x - y);
  const valid = (d: number) => Number.isInteger(d) && d >= 1 && d <= 9;
  if (ds.length === 0 || !ds.every(valid)) {
    throw new RangeError('digits must be integers from 1 to 9');
  }
  const s = String(n);
  const length = s.length;
  const biggest = String(ds[ds.length - 1]);
  let same = 0; // n 的前 same 位都能用可用数字原样照抄
  while (same < length && ds.includes(Number(s[same]))) {
    same++;
  }
  // i 是答案第一次比 n 小的位置：前 i 位照抄，第 i 位放更小的数字，
  // 后面全放最大数字。i 越靠右答案越大，所以从右往左试。
  // 全部照抄就等于 n，所以 i 最多到 length - 1
  for (let i = Math.min(same, length - 1); i >= 0; i--) {
    const smaller = ds.filter((d) => d < Number(s[i]));
    if (smaller.length > 0) {
      const head = s.slice(0, i) + String(smaller[smaller.length - 1]);
      return Number(head + biggest.repeat(length - i - 1));
    }
  }
  // 同样位数拼不出来，就少一位，每一位都放最大数字
  return length > 1 ? Number(biggest.repeat(length - 1)) : -1;
}
