export type Hit = [doc: number, start: number, end: number];

export function mergeHits(hits: Hit[]): Hit[] {
  for (const [, start, end] of hits) {
    if (start >= end) {
      throw new RangeError('each hit needs start < end');
    }
  }
  // 按 (文档, 起点, 终点) 排序：同一文档挨在一起，起点升序
  const ordered = [...hits].sort(
    (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2],
  );
  const merged: Hit[] = [];
  for (const [doc, start, end] of ordered) {
    const last = merged[merged.length - 1];
    if (last && last[0] === doc && start <= last[2]) {
      // 重叠或首尾相接都并进去；终点取较大者
      last[2] = Math.max(last[2], end);
    } else {
      merged.push([doc, start, end]);
    }
  }
  return merged;
}
