export function chunkSpans(
  n: number,
  size: number,
  overlap: number,
): [number, number][] {
  if (n < 0 || size <= 0 || overlap < 0 || overlap >= size) {
    throw new RangeError('need n >= 0 and 0 <= overlap < size');
  }
  const step = size - overlap; // 相邻两块起点的距离，一定 >= 1
  const spans: [number, number][] = [];
  let start = 0;
  while (start < n) {
    const end = Math.min(start + size, n);
    spans.push([start, end]);
    // 这一块已经到文档末尾，再切只会切出重复的碎片
    if (end === n) break;
    start += step;
  }
  return spans;
}
