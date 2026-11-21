// 对每个到达时刻 t，(t - w, t] 内放行的请求不能超过 limit 个。
// 按输入顺序返回每个请求是否放行。
export function allowRequests(
  times: number[],
  w: number,
  limit: number,
): boolean[] {
  if (w <= 0 || limit < 0) {
    throw new Error('w 必须是正整数，limit 不能为负');
  }
  for (let i = 1; i < times.length; i++) {
    if (times[i - 1] > times[i]) {
      throw new Error('时间必须按非递减顺序给出');
    }
  }
  // 只装已放行请求的时间，从早到晚。
  // 用数组加队头下标 head 代替 shift()，出队是 O(1)
  const active: number[] = [];
  let head = 0;
  const result: boolean[] = [];
  for (const t of times) {
    // 时间 <= t - w 的请求已经不在 (t - w, t] 里
    while (head < active.length && active[head] <= t - w) head++;
    if (head > 64 && head * 2 > active.length) {
      // 出队的超过一半时整体挪一次，数组长度保持 O(limit)，均摊 O(1)
      active.splice(0, head);
      head = 0;
    }
    const allowed = active.length - head < limit;
    result.push(allowed);
    if (allowed) active.push(t); // 被拒绝的请求不占名额
  }
  return result;
}
