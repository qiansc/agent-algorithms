import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packContextBlocks, type Message } from './followup.ts';
import { packContext } from './solution.ts';

const msgs: Message[] = [['system', 4], ['user', 3], ['assistant', 2], ['tool', 9], ['assistant', 5], ['user', 2]];

test('context-window-packing · 延伸：调用和结果同进同出', () => {
  assert.deepEqual(packContextBlocks(msgs, 20), [[['system', 4], ['assistant', 5], ['user', 2]], 9]);
  assert.deepEqual(packContextBlocks(msgs, 27), [msgs, 2]);
  assert.deepEqual(packContextBlocks(msgs, 4), [[['system', 4]], 0]);
});

test('context-window-packing · 延伸：一个块里有多条结果', () => {
  const more: Message[] = [...msgs.slice(0, 4), ['tool', 1], ...msgs.slice(4)];
  assert.deepEqual(packContextBlocks(more, 22), [[['system', 4], ['assistant', 5], ['user', 2]], 11]);
  assert.deepEqual(packContextBlocks(more, 26), [more, 0]);
});

test('context-window-packing · 原题规则不会拆开工具调用', () => {
  assert.deepEqual(packContext(msgs, 20), [[['system', 4], ['user', 2]], 14]);
});

test('context-window-packing · 延伸：非法预算', () => {
  assert.throws(() => packContextBlocks(msgs, 3), RangeError);
  assert.throws(() => packContextBlocks(msgs, -1), RangeError);
});
