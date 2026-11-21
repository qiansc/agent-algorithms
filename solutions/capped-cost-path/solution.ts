export function cappedCost(
  n: number,
  edges: [number, number, number][],
  src: number,
  dst: number,
  limit: number,
): number {
  const inRange = (x: number) => Number.isInteger(x) && x >= 0 && x < n;
  if (n <= 0 || limit < 0 || !inRange(src) || !inRange(dst)) {
    throw new Error('n 必须为正，limit 不能为负，起点终点要在 0..n-1 之间');
  }
  for (const [u, v, cost] of edges) {
    if (!inRange(u) || !inRange(v) || cost < 0) {
      throw new Error(`非法的边 ${[u, v, cost]}`);
    }
  }

  // previous[v]：最多走 k 条边到 v 的最低价，这里 k 是已经做完的层数
  let previous: number[] = new Array(n).fill(Infinity);
  previous[src] = 0;
  for (let k = 0; k < limit; k++) {
    // 少走一步也算“最多 k 步”，先整层抄下来
    const current = previous.slice();
    for (const [u, v, cost] of edges) {
      // 只能从上一层出发，否则一轮里可能连走好几条边
      current[v] = Math.min(current[v], previous[u] + cost);
    }
    // 这一层什么都没变，后面也不会变
    if (current.every((x, i) => x === previous[i])) break;
    previous = current;
  }
  return previous[dst] === Infinity ? -1 : previous[dst];
}
