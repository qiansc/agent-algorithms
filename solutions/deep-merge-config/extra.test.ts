import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deepMerge, type JsonObject } from './solution.ts';
import { deepMergeWithDelete } from './followup.ts';

const BASE: JsonObject = { model: { name: 'a', temp: 0.7 }, tools: ['search'], retry: 1 };
const OVERRIDE: JsonObject = { model: { temp: 0.2, top_p: 0.9 }, tools: ['db'], retry: { max: 3 } };

test('deep-merge-config · 不修改输入，结果与输入互不影响', () => {
  const base = structuredClone(BASE);
  const override = structuredClone(OVERRIDE);
  const result = deepMerge(base, override) as any;
  assert.deepEqual(base, BASE);
  assert.deepEqual(override, OVERRIDE);
  result.model.name = 'changed';
  result.tools.push('x');
  result.retry.max = 9;
  assert.deepEqual(base, BASE);
  assert.deepEqual(override, OVERRIDE);
  const src: JsonObject = { keep: { deep: [1] } };
  (deepMerge(src, {}) as any).keep.deep.push(2);
  assert.deepEqual(src, { keep: { deep: [1] } });
});

test('deep-merge-config · __proto__ 只是普通的键，不会改原型', () => {
  const evil = JSON.parse('{"__proto__": {"polluted": 1}, "a": {"__proto__": {"x": 1}}}');
  const result = deepMerge({ a: { y: 2 } }, evil);
  assert.equal(({} as any).polluted, undefined);
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.ok(Object.hasOwn(result, '__proto__'));
  assert.equal((result as any).polluted, undefined);
  assert.deepEqual(Object.keys(result).sort(), ['__proto__', 'a']);
  assert.ok(Object.hasOwn(result.a as object, '__proto__'));
  assert.equal((result.a as any).y, 2);
});

test('deep-merge-config · 键的顺序（整数形式的键会被 JS 排到前面）', () => {
  assert.deepEqual(Object.keys(deepMerge({ b: 1, a: 2 }, { c: 3, a: 4 })), ['b', 'a', 'c']);
  assert.deepEqual(Object.keys(deepMerge({ b: 1 }, { 2: 0, 1: 0 })), ['1', '2', 'b']);
});

test('deep-merge-config · 延伸：null 表示删除', () => {
  assert.deepEqual(deepMergeWithDelete(BASE, { model: { temp: null }, retry: null }), { model: { name: 'a' }, tools: ['search'] });
  assert.deepEqual(deepMergeWithDelete(BASE, { gone: null, extra: { x: null, y: 1 } }), { ...BASE, extra: { y: 1 } });
  assert.deepEqual(deepMergeWithDelete({ retry: 1 }, { retry: { max: null, n: 2 } }), { retry: { n: 2 } });
  assert.deepEqual(deepMergeWithDelete({}, { a: [null] }), { a: [null] });
  assert.deepEqual(deepMergeWithDelete(BASE, OVERRIDE), deepMerge(BASE, OVERRIDE));
});
