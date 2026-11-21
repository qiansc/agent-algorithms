function unit(vec: number[]): number[] | null {
  const length = Math.sqrt(vec.reduce((s, x) => s + x * x, 0));
  if (length === 0) return null;
  return vec.map((x) => x / length);
}

export class CosineIndex {
  dim: number;
  units: [number, number[]][] = [];

  constructor(docs: number[][]) {
    // 入库时归一化一次；全零文档没有方向，不入库
    this.dim = docs.length > 0 ? docs[0].length : 0;
    docs.forEach((vec, idx) => {
      const u = unit(vec);
      if (u !== null) this.units.push([idx, u]);
    });
  }

  query(q: number[], k: number): number[] {
    if (this.units.length > 0 && q.length !== this.dim) {
      throw new Error('查询向量维数不对');
    }
    const qu = unit(q);
    if (qu === null) throw new Error('查询向量不能全为零');
    if (k <= 0) return [];
    // 两边都是单位向量，点积就是余弦，每篇只剩 d 次乘加
    const scored = this.units.map(([idx, u]): [number, number] => [
      u.reduce((s, x, i) => s + qu[i] * x, 0),
      idx,
    ]);
    scored.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    return scored.slice(0, k).map(([, idx]) => idx);
  }
}
