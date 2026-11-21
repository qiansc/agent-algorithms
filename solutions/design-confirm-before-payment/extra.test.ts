import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrderApi, Rejected, advance } from './solution.ts';

test('confirm-before-payment · 非法状态转移会抛错', () => {
  const bad: [string, string][] = [
    ['draft', 'submit'], ['awaiting_confirm', 'submit'],
    ['placed', 'submit'], ['unknown', 'submit'],
  ];
  for (const [state, event] of bad) {
    assert.throws(() => advance(state, event));
  }
});

test('confirm-before-payment · 确认路径', () => {
  let s = advance('draft', 'preview');
  s = advance(s, 'edit');
  s = advance(advance(s, 'preview'), 'confirm');
  assert.equal(s, 'confirmed');
});

test('confirm-before-payment · 同一个 key 换了内容会被拒绝', () => {
  const api = new OrderApi([]);
  assert.equal(api.place('k1', { amount_cents: 5700 }), 'o1');
  assert.equal(api.place('k1', { amount_cents: 5700 }), 'o1');
  assert.throws(() => api.place('k1', { amount_cents: 6100 }), Rejected);
  assert.equal(api.created, 1);
});
