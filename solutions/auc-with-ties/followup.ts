import { auc } from './solution.ts';

/** 按用户分组各算 AUC，再按每个用户的样本数加权平均。 */
export function gauc(
  users: string[],
  scores: number[],
  labels: number[],
): number {
  const n = users.length;
  if (scores.length !== n || labels.length !== n) {
    throw new RangeError('inputs must have the same length');
  }
  const groups = new Map<string, number[]>();
  users.forEach((user, i) => {
    const idx = groups.get(user) ?? [];
    idx.push(i);
    groups.set(user, idx);
  });
  let weighted = 0;
  let total = 0;
  for (const idx of groups.values()) {
    const ys = idx.map((i) => labels[i]);
    // 只有一种标签，这个用户算不出 AUC，跳过
    if (ys.every((y) => y === 1) || ys.every((y) => y === 0)) continue;
    weighted += idx.length * auc(idx.map((i) => scores[i]), ys);
    total += idx.length;
  }
  if (total === 0) {
    throw new RangeError('no user has both positives and negatives');
  }
  return weighted / total;
}
