interface Entry {
  name: string;
  count: number;
}

// 定义“a 比 b 差”：次数少的更差，次数相同时名称大的更差
function worse(a: Entry, b: Entry): boolean {
  if (a.count !== b.count) return a.count < b.count;
  return a.name > b.name;
}

// 小顶堆：堆顶是最差的一项。JavaScript 没有内置的堆，这里手写上浮和下沉
class MinHeap {
  items: Entry[] = [];

  get size(): number {
    return this.items.length;
  }

  peek(): Entry {
    return this.items[0];
  }

  push(e: Entry): void {
    const a = this.items;
    a.push(e);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!worse(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  pop(): Entry {
    const a = this.items;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  replaceTop(e: Entry): void {
    this.items[0] = e;
    this.siftDown(0);
  }

  private siftDown(i: number): void {
    const a = this.items;
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < a.length && worse(a[l], a[m])) m = l;
      if (r < a.length && worse(a[r], a[m])) m = r;
      if (m === i) return;
      [a[i], a[m]] = [a[m], a[i]];
      i = m;
    }
  }
}

export function topToolsHeap(calls: string[], k: number): string[] {
  if (k <= 0) return [];
  // 计数必须先做完，不能边读边淘汰
  const counts = new Map<string, number>();
  for (const name of calls) {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const heap = new MinHeap(); // 堆顶是目前留下的 k 个里最差的那个
  for (const [name, count] of counts) {
    const entry = { name, count };
    if (heap.size < k) {
      heap.push(entry);
    } else if (worse(heap.peek(), entry)) {
      heap.replaceTop(entry); // 新来的比堆顶好，换掉堆顶
    }
  }
  const result: string[] = [];
  // 从最差的开始弹出，最后倒过来
  while (heap.size > 0) result.push(heap.pop().name);
  return result.reverse();
}
