// children[i] = [n, W]：访问次数和累计价值。
// 按 UCT 分数返回所选孩子的下标。
export function uctPick(children: number[][], c = Math.SQRT2): number {
  if (children.length === 0) throw new Error('至少要有一个孩子');
  for (const [n] of children) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('访问次数必须是非负整数');
    }
  }
  const firstUnvisited = children.findIndex(([n]) => n === 0);
  // 没试过的孩子先试，取下标最小的
  if (firstUnvisited !== -1) return firstUnvisited;
  const parent = children.reduce((s, [n]) => s + n, 0);
  const logParent = Math.log(parent);
  let best = 0;
  let bestScore = -Infinity;
  children.forEach(([n, total], i) => {
    const score = total / n + c * Math.sqrt(logParent / n);
    if (score > bestScore) {
      // 严格大于：同分保留下标小的
      best = i;
      bestScore = score;
    }
  });
  return best;
}
