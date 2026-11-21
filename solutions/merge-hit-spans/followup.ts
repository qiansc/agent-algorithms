import type { Hit } from './solution.ts';

/** 同一文档里两段之间空着不超过 gap 个 token，也拼成一段。 */
export function mergeHitsWithGap(hits: Hit[], gap: number): Hit[] {
  if (gap < 0) throw new RangeError('gap must be >= 0');
  const ordered = [...hits].sort(
    (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2],
  );
  const merged: Hit[] = [];
  for (const [doc, start, end] of ordered) {
    const last = merged[merged.length - 1];
    if (last && last[0] === doc && start <= last[2] + gap) {
      last[2] = Math.max(last[2], end);
    } else {
      merged.push([doc, start, end]);
    }
  }
  return merged;
}

export function totalTokens(spans: Hit[]): number {
  return spans.reduce((sum, [, start, end]) => sum + (end - start), 0);
}
