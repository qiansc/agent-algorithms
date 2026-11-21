/**
 * lengths[i] 是第 i 句的 token 数。
 * 返回每块包含的句子区间 [first, end)。
 */
export function chunkSentences(
  lengths: number[],
  size: number,
  overlap: number,
): [number, number][] {
  if (size <= 0 || overlap < 0 || overlap >= size) {
    throw new RangeError('need 0 <= overlap < size');
  }
  if (lengths.some((x) => x <= 0)) {
    throw new RangeError('sentence lengths must be positive');
  }
  const n = lengths.length;
  const spans: [number, number][] = [];
  let start = 0;
  while (start < n) {
    let end = start;
    let total = 0;
    while (end < n && total + lengths[end] <= size) {
      total += lengths[end]; // 能装下就整句装进来
      end += 1;
    }
    // 这一句本身超过 size，单独成块
    if (end === start) end = start + 1;
    spans.push([start, end]);
    if (end === n) break;
    // 从块尾往回带整句给下一块：带上的总长不超过 overlap，
    // 带上之后还要装得下第 end 句，并且不能退回到本块开头
    let nxt = end;
    let carried = 0;
    while (
      nxt - 1 > start &&
      carried + lengths[nxt - 1] <= overlap &&
      carried + lengths[nxt - 1] + lengths[end] <= size
    ) {
      nxt -= 1;
      carried += lengths[nxt];
    }
    start = nxt;
  }
  return spans;
}
