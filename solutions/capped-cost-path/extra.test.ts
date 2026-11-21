import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cappedCostPath } from './followup.ts';
import { cappedCost } from './solution.ts';

const SAMPLE: [number, number, number][] = [[0, 1, 1], [1, 2, 1], [0, 2, 6], [2, 3, 1]];

test('capped-cost-path · 延伸：输出工具链', () => {
  assert.deepEqual(cappedCostPath(4, SAMPLE, 0, 3, 2), [7, [0, 2, 3]]);
  assert.deepEqual(cappedCostPath(4, SAMPLE, 0, 3, 3), [3, [0, 1, 2, 3]]);
  assert.deepEqual(cappedCostPath(4, SAMPLE, 0, 3, 1), [-1, []]);
  assert.deepEqual(cappedCostPath(1, [], 0, 0, 0), [0, [0]]);
  assert.deepEqual(cappedCostPath(3, [[0, 1, 0], [1, 0, 0], [1, 2, 5]], 0, 2, 2), [5, [0, 1, 2]]);
});

test('capped-cost-path · 延伸：随机图上路径合法且价钱一致', () => {
  let seed = 7;
  const rand = (k: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % k;
  };
  for (let it = 0; it < 200; it++) {
    const n = 1 + rand(6);
    const edges: [number, number, number][] = Array.from({ length: rand(13) }, () => [rand(n), rand(n), rand(10)]);
    const src = rand(n);
    const dst = rand(n);
    const limit = rand(5);
    const [cost, path] = cappedCostPath(n, edges, src, dst, limit);
    assert.equal(cost, cappedCost(n, edges, src, dst, limit));
    if (cost === -1) {
      assert.deepEqual(path, []);
      continue;
    }
    assert.equal(path[0], src);
    assert.equal(path[path.length - 1], dst);
    assert.ok(path.length - 1 <= limit);
    let total = 0;
    for (let i = 0; i + 1 < path.length; i++) {
      total += Math.min(...edges.filter(([u, v]) => u === path[i] && v === path[i + 1]).map(([, , c]) => c));
    }
    assert.equal(total, cost);
  }
});
