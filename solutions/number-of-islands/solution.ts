/** 返回 [岛屿数量, 最大岛屿的格子数]。 */
export function islands(grid: number[][]): [number, number] {
  if (grid.some((row) => row.length !== grid[0].length)) {
    throw new Error('每一行的长度必须相同');
  }
  if (grid.some((row) => row.some((v) => v !== 0 && v !== 1))) {
    throw new Error('格子只能是 0 或 1');
  }
  if (grid.length === 0 || grid[0].length === 0) return [0, 0];
  const rows = grid.length;
  const cols = grid[0].length;
  const seen = Array.from({ length: rows }, () =>
    new Array<boolean>(cols).fill(false),
  );
  let count = 0;
  let best = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      count++; // 碰到一块没访问过的陆地：一座新岛
      let area = 0;
      seen[r][c] = true;
      // 数组加头指针当队列，避免 shift() 的 O(n) 搬移
      const queue: [number, number][] = [[r, c]];
      let head = 0;
      while (head < queue.length) {
        const [x, y] = queue[head++];
        area++;
        const around = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        for (const [nx, ny] of around) {
          if (
            nx >= 0 && nx < rows && ny >= 0 && ny < cols &&
            grid[nx][ny] === 1 && !seen[nx][ny]
          ) {
            // 入队时就标记，同一格不会进队两次
            seen[nx][ny] = true;
            queue.push([nx, ny]);
          }
        }
      }
      best = Math.max(best, area);
    }
  }
  return [count, best];
}
