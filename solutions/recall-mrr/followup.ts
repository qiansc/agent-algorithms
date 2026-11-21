import type { Query } from './solution.ts';

/** 每条相关文档算一票：命中数之和 ÷ 标注数之和。 */
export function microRecall(cases: Query[], k: number): number {
  if (k < 0) throw new RangeError('k must be >= 0');
  let hitTotal = 0;
  let relevantTotal = 0;
  for (const [ranking, rel] of cases) {
    const relevant = new Set(rel);
    const hits = ranking.slice(0, k).filter((doc) => relevant.has(doc));
    hitTotal += new Set(hits).size;
    relevantTotal += relevant.size;
  }
  return relevantTotal ? hitTotal / relevantTotal : 0;
}
