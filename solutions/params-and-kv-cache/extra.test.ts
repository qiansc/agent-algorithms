import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kvCacheBytes, paramCount } from './solution.ts';

test('params-and-kv-cache · KV Cache 字节数', () => {
  assert.equal(kvCacheBytes(32, 8, 128, 4096, 1, 2), 536870912);
  assert.equal(kvCacheBytes(32, 32, 128, 4096, 1, 2), 2 * 2 ** 30);
  assert.equal(kvCacheBytes(32, 8, 128, 1, 1, 2), 128 * 1024);
  assert.equal(kvCacheBytes(1, 8, 128, 1, 1, 2), 4096);
  assert.equal(kvCacheBytes(32, 8, 128, 8192, 8, 2), 8 * 2 ** 30);
  assert.equal(kvCacheBytes(1, 1, 1, 1, 1, 1), 2);
});

test('params-and-kv-cache · KV Cache 非法输入', () => {
  assert.throws(() => kvCacheBytes(0, 8, 128, 4096, 1, 2));
  assert.throws(() => kvCacheBytes(32, 8, 128, 4096, 0, 2));
  assert.throws(() => kvCacheBytes(32, 8, 128, -1, 1, 2));
  assert.throws(() => kvCacheBytes(32, 8, 128, 4096.5, 1, 2));
});

test('params-and-kv-cache · 延伸里的数字', () => {
  const weights = 2 * paramCount(32, 4096, 32, 8, 14336, 128256, false);
  assert.equal(weights, 16060522496);
  const perToken = kvCacheBytes(32, 8, 128, 1, 1, 2);
  const free = 24 * 2 ** 30 - weights;
  assert.equal(free, 9709281280);
  assert.equal(Math.floor(free / perToken), 74075);
  assert.equal(Math.floor(free / (8 * perToken)), 9259);
  assert.equal(Math.floor(free / kvCacheBytes(32, 32, 128, 1, 1, 2)), 18518);
});
