// 返回 [最低价, 状态序列]；到不了返回 [-1, []]。
export function cappedCostPath(
  n: number,
  edges: [number, number, number][],
  src: number,
  dst: number,
  limit: number,
): [number, number[]] {
  const inRange = (x: number) => Number.isInteger(x) && x >= 0 && x < n;
  if (n <= 0 || limit < 0 || !inRange(src) || !inRange(dst)) {
    throw new Error('n 必须为正，limit 不能为负，起点终点要在 0..n-1 之间');
  }
  for (const [u, v, cost] of edges) {
    if (!inRange(u) || !inRange(v) || cost < 0) {
      throw new Error(`非法的边 ${[u, v, cost]}`);
    }
  }

  // 每一层都留下来：layers[k][v] 是最多 k 步到 v 的最低价
  const layers: number[][] = [new Array(n).fill(Infinity)];
  layers[0][src] = 0;
  for (let k = 0; k < limit; k++) {
    const previous = layers[layers.length - 1];
    const current = previous.slice();
    for (const [u, v, cost] of edges) {
      current[v] = Math.min(current[v], previous[u] + cost);
    }
    layers.push(current);
  }

  if (layers[limit][dst] === Infinity) return [-1, []];
  // 从第 limit 层的 dst 往回找：
  // 这一格的价钱要么是上一层抄下来的，要么来自某条边
  const path = [dst];
  let v = dst;
  let k = limit;
  while (k > 0) {
    if (layers[k - 1][v] === layers[k][v]) {
      k -= 1; // 少走一步就能拿到同样的价钱，留在原地退一层
      continue;
    }
    for (const [u, w, cost] of edges) {
      if (w === v && layers[k - 1][u] + cost === layers[k][v]) {
        v = u;
        k -= 1;
        path.push(v);
        break;
      }
    }
  }
  path.reverse();
  return [layers[limit][dst], path];
}
