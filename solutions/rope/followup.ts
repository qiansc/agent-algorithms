import { rope } from './solution.ts';

/** 位置 m 的查询和位置 n 的键，各自旋转后的点积。 */
export function ropeScore(
  q: number[],
  k: number[],
  m: number,
  n: number,
  base = 10000,
): number {
  if (q.length !== k.length) {
    throw new RangeError('q and k must have the same length');
  }
  const rq = rope(q, m, base);
  const rk = rope(k, n, base);
  return rq.reduce((acc, x, i) => acc + x * rk[i], 0);
}
