export function passAtK(n: number, c: number, k: number): number {
  if (![n, c, k].every(Number.isInteger)) {
    throw new Error('n、c、k 必须是整数');
  }
  if (!(0 <= c && c <= n && 1 <= k && k <= n)) {
    throw new Error('要求 0 <= c <= n 且 1 <= k <= n');
  }
  if (c === 0) return 0;
  if (n - c < k) return 1; // 失败记录凑不满 k 条，抽到的里面一定有成功
  // 全失败的概率 = 每一抽都继续落在失败记录上的概率连乘，改成对数相加
  let logFailure = 0;
  for (let i = 0; i < k; i++) {
    // 已经拿走 i 条失败记录：池里剩 n - i 条，成功的仍是 c 条
    logFailure += Math.log1p(-c / (n - i));
  }
  return -Math.expm1(logFailure); // 1 - exp(x)，结果很小时也保留精度
}
