import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ToolNames } from './solution.ts';
import { allowedTokens } from './followup.ts';

test('tool-name-trie · 非法工具名', () => {
  for (const bad of [['go', ''], ['Go'], ['get_weather'], ['搜索']]) {
    assert.throws(() => new ToolNames(bad));
  }
});

test('tool-name-trie · 返回的是新列表', () => {
  const t = new ToolNames(['go', 'gone', 'get']);
  t.allowed('g')[0].push('z');
  assert.deepEqual(t.allowed('g'), [['e', 'o'], false]);
});

test('tool-name-trie · 延伸：多字符 token', () => {
  const t = new ToolNames(['go', 'gone', 'get']);
  assert.deepEqual(allowedTokens(t, 'g', ['o', 'one', 'et', 'e', 'ox', 'on', '', 'n']), ['e', 'et', 'o', 'on', 'one']);
  assert.deepEqual(allowedTokens(t, 'go', ['ne', 'nex', 'n', 'e']), ['n', 'ne']);
  assert.deepEqual(allowedTokens(t, 'x', ['a']), []);
  assert.deepEqual(allowedTokens(t, 'gone', ['s']), []);
  assert.deepEqual(allowedTokens(t, '', ['go', 'go', 'ge']), ['ge', 'go']);
});
