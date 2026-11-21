import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rightViewDfs } from './followup.ts';
import { rightView, type Tree } from './solution.ts';

test('right-side-view · 延伸：样例', () => {
  const sample: Tree<string> = ['A', ['B', ['D', null, null], null], ['C', null, null]];
  assert.deepEqual(rightViewDfs(sample), ['A', 'C', 'D']);
  assert.deepEqual(rightViewDfs(null), []);
});

test('right-side-view · 延伸：随机树与按层遍历一致', () => {
  let seed = 52;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  const build = (n: number): Tree<number> => {
    if (n === 0) return null;
    const k = rand(n);
    return [rand(101) - 50, build(k), build(n - 1 - k)];
  };
  for (let t = 0; t < 500; t++) {
    const tree = build(rand(41));
    assert.deepEqual(rightViewDfs(tree), rightView(tree));
  }
});

test('right-side-view · 延伸：10 万层的链不靠递归', () => {
  let tree: Tree<number> = null;
  for (let v = 100_000; v >= 1; v--) tree = [v, tree, null];
  assert.deepEqual(rightViewDfs(tree), Array.from({ length: 100_000 }, (_, i) => i + 1));
});
