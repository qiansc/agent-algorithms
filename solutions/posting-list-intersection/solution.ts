export function intersectLists(lists: number[][]): number[] {
  if (lists.length === 0) return [];
  // 从最短的表起步
  const ordered = [...lists].sort((a, b) => a.length - b.length);
  let result = [...ordered[0]];
  for (const other of ordered.slice(1)) {
    // 已经没有公共编号，后面的表不用再看
    if (result.length === 0) break;
    let i = 0;
    let j = 0;
    const common: number[] = [];
    while (i < result.length && j < other.length) {
      if (result[i] < other[j]) {
        i += 1; // other 往后只会更大，result[i] 不会有搭档
      } else if (result[i] > other[j]) {
        j += 1;
      } else {
        common.push(result[i]);
        i += 1;
        j += 1;
      }
    }
    result = common;
  }
  return result;
}
