// 小顶堆：堆顶是最小的数。数组下标 i 的孩子在 2i+1 和 2i+2。
export class MinHeap {
  private a: number[] = [];

  get size(): number {
    return this.a.length;
  }

  push(x: number): void {
    const a = this.a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  pop(): number {
    const a = this.a;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last; // 末尾元素放到堆顶，再往下沉
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

export function toolOrder(
  n: number,
  edges: [number, number][],
): number[] {
  const children: number[][] = Array.from({ length: n }, () => []);
  const missing = new Array<number>(n).fill(0); // 入度：还差几个前置
  for (const [before, after] of edges) {
    if (!(before >= 0 && before < n && after >= 0 && after < n)) {
      throw new RangeError('tool id out of range');
    }
    children[before].push(after);
    missing[after] += 1;
  }

  const ready = new MinHeap(); // 所有已就绪的工具，堆顶是编号最小的
  for (let i = 0; i < n; i++) if (missing[i] === 0) ready.push(i);
  const order: number[] = [];
  while (ready.size > 0) {
    const tool = ready.pop();
    order.push(tool);
    for (const child of children[tool]) {
      missing[child] -= 1;
      if (missing[child] === 0) ready.push(child);
    }
  }
  // 堆空了还有工具没执行：剩下的互相等待，有环
  return order.length === n ? order : [];
}
