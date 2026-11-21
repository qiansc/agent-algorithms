// 每个任务跑 n 次，results[i] 是第 i 个任务每次是否成功。
// pass@k：k 次里至少成功一次的概率；pass^k：k 次全部成功的概率。
// 两者都是“从 n 次里不放回地抽 k 次”的无偏估计，再对任务取平均。

// C(n-c, k) / C(n, k)：抽到的 k 次全是失败的概率
function allFail(n: number, c: number, k: number): number {
  let p = 1;
  for (let i = 0; i < k; i++) {
    p *= (n - c - i) / (n - i);
    if (p === 0) break;
  }
  return p;
}

// C(c, k) / C(n, k)：抽到的 k 次全是成功的概率
function allPass(n: number, c: number, k: number): number {
  let p = 1;
  for (let i = 0; i < k; i++) {
    p *= (c - i) / (n - i);
    if (p === 0) break;
  }
  return p;
}

export function passMetrics(results: boolean[][], k: number) {
  if (results.length === 0) throw new Error('no tasks');
  if (k < 1) throw new Error('k must be >= 1');
  if (results.some((r) => r.length < k)) {
    throw new Error('every task needs at least k trials');
  }
  let at1 = 0;
  let atK = 0;
  let hatK = 0;
  for (const r of results) {
    const n = r.length;
    const c = r.filter(Boolean).length;
    at1 += c / n;
    atK += 1 - allFail(n, c, k);
    hatK += allPass(n, c, k);
  }
  const m = results.length;
  return { 'pass@1': at1 / m, 'pass@k': atK / m, 'pass^k': hatK / m };
}
