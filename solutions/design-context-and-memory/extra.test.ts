import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PreferenceStore } from './solution.ts';

test('context-and-memory · 有效天数必须至少 1 天', () => {
  const store = new PreferenceStore();
  assert.throws(() => store.tell('地址', '酒店', 1, 0));
});
