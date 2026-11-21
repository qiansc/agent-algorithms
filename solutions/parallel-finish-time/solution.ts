export function planTime(
  duration: number[],
  edges: [number, number][],
): number {
  const n = duration.length;
  if (duration.some((d) => d <= 0)) {
    throw new RangeError('durations must be positive');
  }
  const children: number[][] = Array.from({ length: n }, () => []);
  // 入度：还有几个前置没完成
  const missing = new Array<number>(n).fill(0);
  for (const [parent, child] of edges) {
    if (!(parent >= 0 && parent < n && child >= 0 && child < n)) {
      throw new RangeError('tool id out of range');
    }
    children[parent].push(child);
    missing[child] += 1;
  }

  // finish[v]：v 最早什么时候完成。没有前置时就是它自己的耗时
  const finish = [...duration];
  const ready: number[] = [];
  for (let i = 0; i < n; i++) if (missing[i] === 0) ready.push(i);
  let head = 0; // 用下标代替 shift()，出队是 O(1)
  while (head < ready.length) {
    const parent = ready[head++];
    for (const child of children[parent]) {
      // child 要等最晚的那个前置，所以取 max
      const viaParent = finish[parent] + duration[child];
      finish[child] = Math.max(finish[child], viaParent);
      missing[child] -= 1;
      if (missing[child] === 0) ready.push(child);
    }
  }
  if (ready.length < n) return -1; // 有环：环上的工具永远等不到前置
  // 不用 Math.max(...finish)：10 万个参数可能超出调用栈限制
  return finish.reduce((a, b) => Math.max(a, b), 0);
}
