/**
 * 减法版惩罚：出现 c 次的编号减 c × frequencyPenalty，
 * 只要出现过就再减一次 presencePenalty。
 */
export function additivePenalties(
  logits: number[],
  generated: number[],
  frequencyPenalty: number,
  presencePenalty: number,
): number[] {
  const n = logits.length;
  const valid = (t: number) => Number.isInteger(t) && t >= 0 && t < n;
  if (!generated.every(valid)) {
    throw new RangeError('generated token id out of range');
  }
  const counts = new Map<number, number>();
  for (const t of generated) counts.set(t, (counts.get(t) ?? 0) + 1);
  const scores = [...logits];
  for (const [t, c] of counts) {
    scores[t] -= c * frequencyPenalty + presencePenalty;
  }
  return scores;
}
