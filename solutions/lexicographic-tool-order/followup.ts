// 返回 'cycle'（有环）、'unique'（合法顺序唯一）或 'many'。
export function orderKind(
  n: number,
  edges: [number, number][],
): 'cycle' | 'unique' | 'many' {
  const children: number[][] = Array.from({ length: n }, () => []);
  const missing = new Array<number>(n).fill(0);
  for (const [before, after] of edges) {
    children[before].push(after);
    missing[after] += 1;
  }

  // 只关心每一步有几个候选，不关心先取谁，普通队列就够了
  const ready: number[] = [];
  for (let i = 0; i < n; i++) if (missing[i] === 0) ready.push(i);
  let head = 0;
  let unique = true;
  while (head < ready.length) {
    if (ready.length - head > 1) unique = false; // 这一步有两个以上可选
    const tool = ready[head++];
    for (const child of children[tool]) {
      missing[child] -= 1;
      if (missing[child] === 0) ready.push(child);
    }
  }
  if (ready.length < n) return 'cycle';
  return unique ? 'unique' : 'many';
}
