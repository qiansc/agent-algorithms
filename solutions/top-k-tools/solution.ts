export function topTools(calls: string[], k: number): string[] {
  if (k <= 0) return [];
  const counts = new Map<string, number>(); // 工具名 -> 调用次数
  for (const name of calls) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  // 次数多的在前；次数相同按名称升序（用 < 和 >，不用 localeCompare）
  const ordered = [...counts.keys()].sort((a, b) => {
    const diff = counts.get(b)! - counts.get(a)!;
    if (diff !== 0) return diff;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return ordered.slice(0, k);
}
