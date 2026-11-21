// 小顶堆：数组里 i 的孩子在 2i+1 和 2i+2，堆顶 items[0] 最小
export class MinHeap {
  items: number[] = [];

  get size(): number {
    return this.items.length;
  }

  peek(): number {
    return this.items[0];
  }

  push(x: number): void {
    const a = this.items;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (a[parent] <= a[i]) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }

  // 用 x 换掉堆顶，再把它往下沉到合适的位置
  replaceTop(x: number): void {
    const a = this.items;
    a[0] = x;
    let i = 0;
    while (true) {
      const l = 2 * i + 1;
      const r = l + 1;
      let small = i;
      if (l < a.length && a[l] < a[small]) small = l;
      if (r < a.length && a[r] < a[small]) small = r;
      if (small === i) break;
      [a[small], a[i]] = [a[i], a[small]];
      i = small;
    }
  }
}

export class KthScore {
  k: number;
  top = new MinHeap(); // 只放目前最高的 k 个分数

  constructor(k: number) {
    if (k < 1) throw new RangeError('k must be >= 1');
    this.k = k;
  }

  add(score: number): number | null {
    if (this.top.size < this.k) {
      this.top.push(score);
    } else if (score > this.top.peek()) {
      // 新分数挤掉门槛：换掉堆顶，一步完成
      this.top.replaceTop(score);
    }
    if (this.top.size < this.k) return null;
    return this.top.peek(); // k 个里最小的，就是全体的第 k 大
  }
}
