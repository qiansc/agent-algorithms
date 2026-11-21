// 小顶堆：堆顶是最小的数。数组下标 i 的孩子在 2i+1 和 2i+2。
export class MinHeap {
  private a: number[] = [];

  constructor(items: number[] = []) {
    for (const x of items) this.push(x);
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

export function runLimited(
  durations: number[],
  limit: number,
): [number[], number[]] {
  if (limit < 1) throw new RangeError('limit must be >= 1');
  if (durations.some((d) => d <= 0)) {
    throw new RangeError('durations must be positive');
  }
  // 每个空位下一次空出来的时刻；调用比空位少时，多余的空位用不上
  const slots = Math.min(limit, durations.length);
  const freeAt = new MinHeap(new Array<number>(slots).fill(0));
  const finish: number[] = [];
  for (const d of durations) {
    const start = freeAt.pop(); // 最早空出来的那个位置
    finish.push(start + d);
    freeAt.push(start + d);
  }
  // 完成顺序：先按完成时刻，同一时刻按下标
  const order = durations.map((_, i) => i);
  order.sort((i, j) => finish[i] - finish[j] || i - j);
  return [finish, order];
}
