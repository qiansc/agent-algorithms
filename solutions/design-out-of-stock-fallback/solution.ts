// 缺货时挑替代品：先按硬约束过滤，再打分排序，
// 最后决定自动换还是问用户。

export interface Wanted {
  name: string;
  category: string;
  temp?: string | null;
  price: number;
  store: string;
  max_eta: number;
}
export interface Candidate {
  id: string;
  name: string;
  store: string;
  category: string;
  temp: string;
  tags: string[];
  price: number;
  extra_fee: number;
  eta: number;
}

const EXACT = 5;
const SAME_CATEGORY = 3;
const SAME_STORE = 2;
const PER_YUAN = 0.4; // 每多花 1 元扣的分

export function chooseFallback(
  wanted: Wanted, candidates: Candidate[],
  avoid: string[], maxExtraAuto: number,
) {
  const kept: [number, number, string][] = [];
  const dropped: Record<string, string> = {};
  for (const c of candidates) {
    // 硬约束：用户说出口的条件、忌口、送达时间，违反一条就淘汰
    if (wanted.temp && c.temp !== wanted.temp) {
      dropped[c.id] = '温度不符';
      continue;
    }
    const bad = c.tags.filter((t) => avoid.includes(t));
    if (bad.length) {
      dropped[c.id] = '忌口：' + bad[0];
      continue;
    }
    if (c.eta > wanted.max_eta) {
      dropped[c.id] = `送达 ${c.eta} 分钟`;
      continue;
    }
    // 换另一家店要多付的配送费也算进差价；便宜了不加分
    const extra = c.price + c.extra_fee - wanted.price;
    let score = 0;
    if (c.name === wanted.name) score = EXACT;
    else if (c.category === wanted.category) score = SAME_CATEGORY;
    if (c.store === wanted.store) score += SAME_STORE;
    score -= PER_YUAN * Math.max(0, extra);
    // 0.4 这类小数有二进制误差，保留两位再比较
    kept.push([Math.round(score * 100) / 100, extra, c.id]);
  }

  // 分高的在前；同分时多花钱少的在前；再按 id 保证结果稳定
  kept.sort(
    (a, b) => b[0] - a[0] || a[1] - b[1] || (a[2] < b[2] ? -1 : 1),
  );
  const ranked = kept.map(([score, , id]) => [id, score]);
  if (kept.length === 0) {
    return { action: 'give_up', options: [], ranked, dropped };
  }
  const best = candidates.find((c) => c.id === kept[0][2])!;
  // 只有“同一家店的同一件商品，差价很小”才自动换，例如换杯型
  const sameItem = best.name === wanted.name;
  const sameStore = best.store === wanted.store;
  if (sameItem && sameStore && kept[0][1] <= maxExtraAuto) {
    return { action: 'auto', options: [best.id], ranked, dropped };
  }
  const options = kept.slice(0, 2).map((k) => k[2]);
  return { action: 'ask', options, ranked, dropped };
}
