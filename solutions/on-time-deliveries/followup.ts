// orders[i] = [d, D, v]：时长 d、截止时间 D、价值 v。
// 返回准时完成的订单价值之和的最大值。
export function maxOnTimeValue(orders: number[][]): number {
  for (const order of orders) {
    if (order.length !== 3) throw new Error('每一单必须是 [d, D, v]');
    const [d, deadline, value] = order;
    if (d < 1 || deadline < 0 || value < 0) {
      throw new Error('d 至少为 1，D 和 v 不能为负');
    }
  }
  const horizon = Math.max(0, ...orders.map((o) => o[1]));
  // best[t]：已选订单总时长恰好为 t 时的最大价值，null 表示凑不出
  const best: (number | null)[] = Array<null>(horizon + 1).fill(null);
  best[0] = 0;
  const sorted = [...orders].sort((x, y) => x[1] - y[1]);
  for (const [d, deadline, value] of sorted) {
    // 这一单排在已选订单之后，回到店里的时刻 t 不能超过 D；
    // t 从大到小走，保证每单只用一次
    for (let t = deadline; t >= d; t--) {
      const prev = best[t - d];
      if (prev === null) continue;
      const cur = best[t];
      if (cur === null || prev + value > cur) best[t] = prev + value;
    }
  }
  return Math.max(...best.filter((v): v is number => v !== null));
}
