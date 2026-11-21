import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceEdits, type Edit } from './followup.ts';
import { traceDistance } from './solution.ts';

function apply(a: string[], edits: Edit[]): string[] {
  const out: string[] = [];
  let pos = 0;
  for (const [op, src, dst] of edits) {
    if (op === 'insert') {
      out.push(dst as string);
      continue;
    }
    assert.equal(a[pos], src);
    pos++;
    if (op !== 'delete') out.push(dst as string);
  }
  assert.equal(pos, a.length);
  return out;
}

test('trajectory-edit-distance · 延伸：样例的修改清单', () => {
  assert.deepEqual(traceEdits(['查票', '查票', '付款'], ['查票', '确认', '付款']), [
    ['keep', '查票', '查票'],
    ['replace', '查票', '确认'],
    ['keep', '付款', '付款'],
  ]);
  assert.deepEqual(traceEdits(['搜索', '查票', '付款'], ['查票', '付款', '搜索']), [
    ['delete', '搜索', null],
    ['keep', '查票', '查票'],
    ['keep', '付款', '付款'],
    ['insert', null, '搜索'],
  ]);
  assert.deepEqual(traceEdits([], []), []);
  assert.deepEqual(traceEdits(['查票'], []), [['delete', '查票', null]]);
});

test('trajectory-edit-distance · 延伸：清单可执行且最短', () => {
  let seed = 48;
  const rand = (m: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % m;
  };
  const tools = ['搜索', '查票', '付款', '确认'];
  for (let t = 0; t < 300; t++) {
    const a = Array.from({ length: rand(8) }, () => tools[rand(4)]);
    const b = Array.from({ length: rand(8) }, () => tools[rand(4)]);
    const edits = traceEdits(a, b);
    assert.deepEqual(apply(a, edits), b);
    assert.equal(edits.filter(([op]) => op !== 'keep').length, traceDistance(a, b));
  }
});
