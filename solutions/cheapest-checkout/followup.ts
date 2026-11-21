type Plan = { total: number; picked: number[] };

// 先比第一项，再比件数，最后比下标列表的字典序。
function keyLess(a: [number, number[]], b: [number, number[]]): boolean {
  if (a[0] !== b[0]) return a[0] < b[0];
  if (a[1].length !== b[1].length) return a[1].length < b[1].length;
  for (let i = 0; i < a[1].length; i++) {
    if (a[1][i] !== b[1][i]) return a[1][i] < b[1][i];
  }
  return false;
}

// 店铺满减之后再叠一张平台券：满减后仍 >= coupon[0] 元，再减 coupon[1] 元。
export function cheapestCheckoutStacked(
  required: number,
  prices: number[],
  tiers: [number, number][],
  coupon: [number, number],
): [number, number[]] {
  const [couponAt, couponOff] = coupon;
  if (required < 0 || prices.some((p) => p <= 0)) {
    throw new Error('必点小计不能为负，加购品价格必须为正');
  }
  for (const [threshold, discount] of [...tiers, coupon]) {
    if (!(discount > 0 && discount <= threshold)) {
      throw new Error(
        `非法满减档 ${[threshold, discount]}：要求 0 < 减额 <= 门槛`,
      );
    }
  }

  const paidOf = (total: number) => {
    const storeOff = Math.max(
      0,
      ...tiers.filter(([t]) => t <= total).map(([, d]) => d),
    );
    const afterStore = total - storeOff;
    return afterStore >= couponAt ? afterStore - couponOff : afterStore;
  };

  // 总额到了 top 之后店铺减额不再变；店铺减完还要 >= couponAt 才能用券，
  // 所以价格函数最后一次往下跳的位置是 max(top, couponAt + 最大减额)
  const top = Math.max(0, ...tiers.map(([t]) => t));
  const maxOff = Math.max(0, ...tiers.map(([, d]) => d));
  const lastDrop = Math.max(top, couponAt + maxOff);
  if (required >= lastDrop) return [paidOf(required), []];

  const cap = lastDrop - required;
  const best: (Plan | null)[] = new Array(cap + 1).fill(null);
  best[0] = { total: required, picked: [] };
  prices.forEach((price, i) => {
    for (let j = cap - 1; j >= 0; j--) {
      const cell = best[j];
      if (cell === null) continue;
      const k = Math.min(j + price, cap);
      const candidate: Plan = {
        total: cell.total + price,
        picked: [...cell.picked, i],
      };
      const old = best[k];
      if (
        old === null ||
        keyLess(
          [candidate.total, candidate.picked],
          [old.total, old.picked],
        )
      ) {
        best[k] = candidate;
      }
    }
  });

  let answer: [number, number[]] | null = null;
  for (const cell of best) {
    if (cell === null) continue;
    const key: [number, number[]] = [paidOf(cell.total), cell.picked];
    if (answer === null || keyLess(key, answer)) answer = key;
  }
  return answer!;
}
