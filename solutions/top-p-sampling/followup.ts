import { EPS } from './solution.ts';

/** 分布和 p 固定：只排序一次，之后每次抽样只做一次二分查找。 */
export class NucleusSampler {
  ids: number[] = [];
  ends: number[] = []; // ends[j]：前 j + 1 项的累计概率

  constructor(probs: number[], p: number) {
    const bad = probs.length === 0 || probs.some((x) => x < 0);
    if (bad || !(p > 0 && p <= 1)) {
      throw new RangeError('need non-negative probs and 0 < p <= 1');
    }
    const order = probs
      .map((_, i) => i)
      .sort((a, b) => probs[b] - probs[a] || a - b);
    let mass = 0;
    for (const i of order) {
      if (probs[i] === 0) break;
      mass += probs[i];
      this.ids.push(i);
      this.ends.push(mass);
      if (mass >= p - EPS) break;
    }
  }

  draw(u: number): number {
    if (!(u >= 0 && u < 1)) throw new RangeError('0 <= u < 1');
    const point = u * this.ends[this.ends.length - 1];
    // 手写 bisect_right：第一个严格大于 point 的累计值
    let lo = 0;
    let hi = this.ends.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.ends[mid] <= point) lo = mid + 1;
      else hi = mid;
    }
    return this.ids[Math.min(lo, this.ids.length - 1)];
  }
}
