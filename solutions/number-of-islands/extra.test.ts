import { test } from 'node:test';
import assert from 'node:assert/strict';
import { islandsAfterAdds } from './followup.ts';
import { islands } from './solution.ts';

test('number-of-islands · 300×300 蛇形通道', () => {
  const n = 300;
  const grid = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  for (let r = 0; r < n; r += 2) {
    grid[r].fill(1);
    if (r + 1 < n) grid[r + 1][r % 4 === 0 ? n - 1 : 0] = 1;
  }
  const land = grid.flat().reduce((a, b) => a + b, 0);
  assert.deepEqual(islands(grid), [1, land]);
});

test('number-of-islands · 延伸：并查集逐格加陆地', () => {
  assert.deepEqual(islandsAfterAdds(3, 3, [[0, 1], [1, 0], [0, 0], [1, 1], [2, 2]]), [1, 2, 1, 1, 2]);
  assert.deepEqual(islandsAfterAdds(3, 3, [[0, 1], [1, 0], [1, 2], [2, 1], [1, 1]]), [1, 2, 3, 4, 1]);
  assert.deepEqual(islandsAfterAdds(2, 2, [[0, 0], [0, 0], [1, 1]]), [1, 1, 2]);
  assert.deepEqual(islandsAfterAdds(2, 2, []), []);
  assert.throws(() => islandsAfterAdds(2, 2, [[2, 0]]));
});

test('number-of-islands · 延伸：随机数据与逐次 BFS 一致', () => {
  let seed = 54;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rand(6);
    const cols = 1 + rand(6);
    const positions: [number, number][] = Array.from({ length: rand(21) }, () => [rand(rows), rand(cols)]);
    const grid = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
    const expected = positions.map(([r, c]) => {
      grid[r][c] = 1;
      return islands(grid)[0];
    });
    assert.deepEqual(islandsAfterAdds(rows, cols, positions), expected);
  }
});
