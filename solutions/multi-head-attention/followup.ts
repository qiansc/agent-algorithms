import { matmul } from './solution.ts';

type Matrix = number[][];

/**
 * GQA：wq、wo 是 d×d；wk、wv 是 d×(groups·dh)。
 * 每 heads / groups 个查询头共用一组 K、V。
 */
export function groupedQueryCausal(
  x: Matrix,
  wq: Matrix,
  wk: Matrix,
  wv: Matrix,
  wo: Matrix,
  heads: number,
  groups: number,
): Matrix {
  if (x.length === 0) return [];
  const dModel = x[0].length;
  const ok = heads > 0 && groups > 0 && dModel % heads === 0;
  if (!ok || heads % groups !== 0) {
    throw new RangeError('need heads | d_model and groups | heads');
  }
  const dh = dModel / heads;
  const perGroup = heads / groups;
  const q = matmul(x, wq);
  const k = matmul(x, wk); // 只有 groups·dh 列
  const v = matmul(x, wv);
  const n = x.length;
  const scale = Math.sqrt(dh);
  const concat: Matrix = Array.from({ length: n }, () => []);
  for (let h = 0; h < heads; h++) {
    const qLo = h * dh;
    // 唯一的改动：K、V 按组取列
    const kvLo = Math.floor(h / perGroup) * dh;
    for (let i = 0; i < n; i++) {
      const scores: number[] = [];
      for (let j = 0; j <= i; j++) {
        let dot = 0;
        for (let c = 0; c < dh; c++) {
          dot += q[i][qLo + c] * k[j][kvLo + c];
        }
        scores.push(dot / scale);
      }
      const peak = Math.max(...scores);
      const weights = scores.map((s) => Math.exp(s - peak));
      const total = weights.reduce((a, b) => a + b, 0);
      const out = new Array<number>(dh).fill(0);
      weights.forEach((w, j) => {
        for (let c = 0; c < dh; c++) {
          out[c] += (w / total) * v[j][kvLo + c];
        }
      });
      concat[i].push(...out);
    }
  }
  return matmul(concat, wo);
}
