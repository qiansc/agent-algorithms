import { test } from 'node:test';
import assert from 'node:assert/strict';
import { longestUniqueText } from './followup.ts';

test('longest-unique-substring · 延伸：返回最靠左的最长子串', () => {
  assert.equal(longestUniqueText('abba'), 'ab');
  assert.equal(longestUniqueText('查票查价'), '票查价');
  assert.equal(longestUniqueText(''), '');
  assert.equal(longestUniqueText('dvdf'), 'vdf');
  assert.equal(longestUniqueText('a😀a😀b'), 'a😀b');
});
