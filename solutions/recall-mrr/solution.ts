export type Doc = number | string;
export type Query = [ranking: Doc[], relevant: Iterable<Doc>];

export function evaluateRankings(
  cases: Query[],
  k: number,
): [number, number] {
  if (k < 0) throw new RangeError('k must be >= 0');
  let recallSum = 0;
  let rrSum = 0;
  let count = 0;
  for (const [ranking, rel] of cases) {
    const relevant = new Set(rel);
    if (relevant.size === 0) continue; // 没有标注答案的查询不参与平均
    const hits = new Set<Doc>(); // 命中的不同编号，重复只算一次
    let first = 0; // 第一个命中的位置，从 1 数；0 表示没命中
    ranking.slice(0, k).forEach((doc, i) => {
      if (relevant.has(doc)) {
        hits.add(doc);
        if (first === 0) first = i + 1;
      }
    });
    recallSum += hits.size / relevant.size;
    rrSum += first ? 1 / first : 0;
    count += 1;
  }
  if (count === 0) return [0, 0];
  return [recallSum / count, rrSum / count];
}
