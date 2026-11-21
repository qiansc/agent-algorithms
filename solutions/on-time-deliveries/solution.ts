// 手写的最大堆：数组下标 0 是堆顶，i 的孩子是 2i+1 和 2i+2。
export class MaxHeap {
  private items: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(value: number): void {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent] >= a[i]) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }

  pop(): number {
    const a = this.items;
    if (a.length === 0) throw new Error('堆是空的');
    const top = a[0];
    const last = a.pop() as number;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let big = i;
        if (l < a.length && a[l] > a[big]) big = l;
        if (r < a.length && a[r] > a[big]) big = r;
        if (big === i) break;
        [a[big], a[i]] = [a[i], a[big]];
        i = big;
      }
    }
    return top;
  }
}

// orders[i] = [d, D]：往返 d 分钟，最晚第 D 分钟回到店里。
// 返回最多能准时完成几单。
export function maxOnTime(orders: number[][]): number {
  for (const order of orders) {
    if (order.length !== 2) throw new Error('每一单必须是 [d, D]');
    const [d, deadline] = order;
    if (d < 1 || deadline < 0) throw new Error('d 至少为 1，D 不能为负');
  }
  const chosen = new MaxHeap(); // 已选订单的时长
  let total = 0; // 已选订单按截止时间排好后，最后一单的完成时刻
  const sorted = [...orders].sort((x, y) => x[1] - y[1]);
  for (const [d, deadline] of sorted) {
    chosen.push(d);
    total += d;
    if (total > deadline) {
      // 超时了：去掉已选里最长的一单（可能就是刚放进来的这单）
      total -= chosen.pop();
    }
  }
  return chosen.size;
}
