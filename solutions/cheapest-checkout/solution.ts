type Plan = { total: number; picked: number[] };

// 下标列表按字典序比较；调用时两边长度相同。
function lexLess(a: number[], b: number[]): boolean {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return a.length < b.length;
}

// 返回 [实付最少多少元, 要加的加购品下标，升序]。
export function cheapestCheckout(
  required: number,
  prices: number[],
  tiers: [number, number][],
): [number, number[]] {
  if (required < 0 || prices.some((p) => p <= 0)) {
    throw new Error('必点小计不能为负，加购品价格必须为正');
  }
  for (const [threshold, discount] of tiers) {
    if (!(discount > 0 && discount <= threshold)) {
      throw new Error(
        `非法满减档 ${[threshold, discount]}：要求 0 < 减额 <= 门槛`,
      );
    }
  }

  // 只用一档：在已经够到的档里取减得最多的那档
  const discountOf = (total: number) =>
    Math.max(0, ...tiers.filter(([t]) => t <= total).map(([, d]) => d));

  const top = Math.max(0, ...tiers.map(([t]) => t));
  if (required >= top) {
    // 不加菜就已经吃到所有档位，再加只会多花钱
    return [required - discountOf(required), []];
  }

  // 格子 j 对应购物车总额 required + j；最后一格 cap 表示“总额 >= top”，
  // 那一格里保留实际总额最小的方案。null 表示凑不出。
  const cap = top - required;
  const best: (Plan | null)[] = new Array(cap + 1).fill(null);
  best[0] = { total: required, picked: [] };

  // 先比总额（只有最后一格会不同），再比件数，最后比下标列表的字典序
  const better = (a: Plan, b: Plan | null): boolean => {
    if (b === null) return true;
    if (a.total !== b.total) return a.total < b.total;
    if (a.picked.length !== b.picked.length) {
      return a.picked.length < b.picked.length;
    }
    return lexLess(a.picked, b.picked);
  };

  prices.forEach((price, i) => {
    // 从大往小扫，保证每件加购品最多用一次；最后一格不再往外扩，越加越贵
    for (let j = cap - 1; j >= 0; j--) {
      const cell = best[j];
      if (cell === null) continue;
      const k = Math.min(j + price, cap);
      const candidate = {
        total: cell.total + price,
        picked: [...cell.picked, i],
      };
      if (better(candidate, best[k])) best[k] = candidate;
    }
  });

  let answer: { paid: number; picked: number[] } | null = null;
  for (const cell of best) {
    if (cell === null) continue;
    const paid = cell.total - discountOf(cell.total);
    if (
      answer === null ||
      paid < answer.paid ||
      (paid === answer.paid &&
        (cell.picked.length < answer.picked.length ||
          (cell.picked.length === answer.picked.length &&
            lexLess(cell.picked, answer.picked))))
    ) {
      answer = { paid, picked: cell.picked };
    }
  }
  // best[0] 一定存在，answer 不会是 null
  return [answer!.paid, answer!.picked];
}
