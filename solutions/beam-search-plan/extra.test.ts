import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beamPlan } from './solution.ts';

const tree = new Map<string, [string, number][]>([
  ['', [['A', -1], ['B', -2], ['C', -4]]],
  ['A', [['X', -8], ['Y', -3]]],
  ['B', [['Y', -1], ['Z', -2]]],
  ['C', [['W', 0]]],
  ['A,X', [['Q', 0]]],
  ['A,Y', [['Q', -1]]],
  ['B,Y', [['Q', -6]]],
  ['B,Z', [['Q', -1]]],
]);
const fromTree = (path: readonly string[]) => tree.get(path.join(',')) ?? [];

// 一棵每个节点都有 a、b、c 三个孩子的树，增量分由路径算出，范围 -5..5
function score(path: readonly string[]): number {
  let s = 0;
  path.forEach((ch, i) => {
    s += ch.charCodeAt(0) * (i + 3);
  });
  return ((s * 7919) % 11) - 5;
}
const generated = (path: readonly string[]): [string, number][] =>
  ['a', 'b', 'c'].map((ch) => [ch, score([...path, ch])]);

function allPaths(depth: number): string[][] {
  let out: string[][] = [[]];
  for (let i = 0; i < depth; i++) out = out.flatMap((p) => ['a', 'b', 'c'].map((ch) => [...p, ch]));
  return out;
}
const pathTotal = (p: string[]) => p.reduce((s, _, i) => s + score(p.slice(0, i + 1)), 0);

test('beam-search-plan · 回调只展开留下的路径，并按束里的顺序', () => {
  const calls: string[] = [];
  const result = beamPlan((path) => {
    calls.push(path.join(','));
    return fromTree(path);
  }, 3, 2);
  assert.deepEqual(result, [['A', 'Y', 'Q'], -5]);
  assert.deepEqual(calls, ['', 'A', 'B', 'B,Y', 'A,Y']);
});

test('beam-search-plan · 束宽足够大时等于穷举', () => {
  for (let depth = 0; depth < 5; depth++) {
    const best = Math.max(...allPaths(depth).map(pathTotal));
    const result = beamPlan(generated, depth, 3 ** depth);
    assert.ok(result);
    assert.equal(result[1], best);
    assert.equal(pathTotal(result[0]), best);
  }
});

test('beam-search-plan · 束宽 1 等于逐步贪心', () => {
  let greedy: string[] = [];
  let acc = 0;
  for (let i = 0; i < 4; i++) {
    let pick = generated(greedy)[0];
    for (const m of generated(greedy)) if (m[1] > pick[1]) pick = m; // 同分保留第一个
    greedy = [...greedy, pick[0]];
    acc += pick[1];
  }
  assert.deepEqual(beamPlan(generated, 4, 1), [greedy, acc]);
});

test('beam-search-plan · 非法参数', () => {
  assert.throws(() => beamPlan(fromTree, 2, 0));
  assert.throws(() => beamPlan(fromTree, -1, 1));
});
