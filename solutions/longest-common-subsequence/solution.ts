export function lcs<T>(
  a: string | readonly T[],
  b: string | readonly T[],
): [number, (T | string)[]] {
  // 字符串按 Unicode 码点切开，和 Python 按字符下标一致
  const xs: readonly (T | string)[] = typeof a === 'string' ? [...a] : a;
  const ys: readonly (T | string)[] = typeof b === 'string' ? [...b] : b;
  const m = xs.length;
  const n = ys.length;
  // dp[i][j]：xs 的前 i 个元素和 ys 的前 j 个元素的最长公共子序列长度
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp.push(new Array<number>(n + 1).fill(0));
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (xs[i - 1] === ys[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 从右下角往回走，把走斜线时经过的元素收集起来
  const out: (T | string)[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (xs[i - 1] === ys[j - 1]) {
      out.push(xs[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--; // 相等时往上走
    } else {
      j--;
    }
  }
  out.reverse();
  return [dp[m][n], out];
}
