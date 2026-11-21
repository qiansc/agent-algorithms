export function longestUniqueText(s: string): string {
  const last = new Map<string, number>();
  const chars = Array.from(s);
  let left = 0;
  let best = 0;
  let start = 0;
  chars.forEach((ch, right) => {
    left = Math.max(left, (last.get(ch) ?? -1) + 1);
    if (right - left + 1 > best) {
      // 严格变长才更新，并列时保留靠左的一段
      best = right - left + 1;
      start = left;
    }
    last.set(ch, right);
  });
  return chars.slice(start, start + best).join('');
}
