// 两项预算都必须恰好用完；做不到返回 -1。
export function bestBranchesExact(
  branches: [number, number, number][],
  callCap: number,
  tokenCap: number,
): number {
  if (callCap < 0 || tokenCap < 0) throw new Error('预算不能为负');
  for (const [calls, tokens, value] of branches) {
    if (calls <= 0 || tokens <= 0 || value <= 0) {
      throw new Error(
        `非法分支 ${[calls, tokens, value]}：三项都要是正整数`,
      );
    }
  }

  // best[c][t]：恰好用掉 c 次调用、t 单位 token 的最高分；凑不出来是负无穷
  const best: number[][] = Array.from({ length: callCap + 1 }, () =>
    new Array(tokenCap + 1).fill(-Infinity),
  );
  best[0][0] = 0;
  for (const [calls, tokens, value] of branches) {
    for (let c = callCap; c >= calls; c--) {
      for (let t = tokenCap; t >= tokens; t--) {
        const take = best[c - calls][t - tokens] + value;
        if (take > best[c][t]) best[c][t] = take;
      }
    }
  }
  const answer = best[callCap][tokenCap];
  return answer === -Infinity ? -1 : answer;
}
