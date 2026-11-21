/** 一开始全是水；每把一格变成陆地，就报告一次当前岛屿数。 */
export function islandsAfterAdds(
  rows: number,
  cols: number,
  positions: [number, number][],
): number[] {
  // 陆地格编号 r * cols + c -> 父节点
  const parent = new Map<number, number>();
  const size = new Map<number, number>();

  const find = (a: number): number => {
    while (parent.get(a) !== a) {
      const grand = parent.get(parent.get(a)!)!;
      parent.set(a, grand); // 路径减半：把自己挂到祖父下面
      a = grand;
    }
    return a;
  };

  let count = 0;
  const result: number[] = [];
  for (const [r, c] of positions) {
    if (!(r >= 0 && r < rows && c >= 0 && c < cols)) {
      throw new Error('位置超出网格');
    }
    const cell = r * cols + c;
    if (parent.has(cell)) {
      // 已经是陆地，岛数不变
      result.push(count);
      continue;
    }
    parent.set(cell, cell);
    size.set(cell, 1);
    count++; // 先当成一座新岛
    const around = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]];
    for (const [nr, nc] of around) {
      if (!(nr >= 0 && nr < rows && nc >= 0 && nc < cols)) continue;
      const other = nr * cols + nc;
      if (!parent.has(other)) continue; // 邻居是水
      let a = find(cell);
      let b = find(other);
      if (a === b) continue; // 这个邻居已经和自己在同一座岛里，不能再减
      if (size.get(a)! < size.get(b)!) [a, b] = [b, a];
      parent.set(b, a); // 小的挂到大的下面
      size.set(a, size.get(a)! + size.get(b)!);
      count--; // 两座岛合成一座
    }
    result.push(count);
  }
  return result;
}
