export function traceDistance(a: string[], b: string[]): number {
  if (b.length > a.length) {
    // 距离对称；让 b 是较短的一条，一行只要 b.length + 1 格
    [a, b] = [b, a];
  }
  // previous[j]：a 的上一个前缀变成 b[:j] 的最少步数；第 0 行是插入 j 次
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  a.forEach((action, idx) => {
    const i = idx + 1;
    const current = [i]; // 第 0 列：把 a[:i] 全部删掉
    b.forEach((target, jdx) => {
      const j = jdx + 1;
      current.push(Math.min(
        // 删掉 a 的这一步
        previous[j] + 1,
        // 插入 b 的这一步
        current[j - 1] + 1,
        // 相同就保留，不同就替换
        previous[j - 1] + (action === target ? 0 : 1),
      ));
    });
    previous = current;
  });
  return previous[previous.length - 1];
}
