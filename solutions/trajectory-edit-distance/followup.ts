export type Edit = [string, string | null, string | null];

// 返回一份最短的修改清单，每项是 [操作, a 里的工具, b 里的工具]。
// 操作是 keep / replace / delete / insert。最短方案不止一种时，
// 从右下角往回走，依次优先：保留或替换、删除、插入。
export function traceEdits(a: string[], b: string[]): Edit[] {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  const edits: Edit[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
    ) {
      const op = a[i - 1] === b[j - 1] ? 'keep' : 'replace';
      edits.push([op, a[i - 1], b[j - 1]]);
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      edits.push(['delete', a[i - 1], null]);
      i--;
    } else {
      edits.push(['insert', null, b[j - 1]]);
      j--;
    }
  }
  return edits.reverse(); // 回溯得到的是倒序
}
