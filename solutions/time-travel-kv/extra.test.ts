import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TimeMapAnyOrder } from './followup.ts';
import { TimeMap } from './solution.ts';

test('time-travel-kv · 时刻不递增时抛错', () => {
  for (const bad of [10, 7]) {
    const m = new TimeMap();
    m.set('座位', 10, '过道');
    assert.throws(() => m.set('座位', bad, '靠窗'), RangeError);
  }
});

test('time-travel-kv · 延伸：乱序写入', () => {
  const m = new TimeMapAnyOrder();
  m.set('座位', 10, '过道');
  m.set('座位', 3, '靠窗');
  assert.deepEqual([2, 3, 9, 10].map((t) => m.get('座位', t)), [null, '靠窗', '靠窗', '过道']);
  m.set('座位', 3, '前排'); // 同一时刻再写一次：覆盖
  assert.deepEqual([3, 9].map((t) => m.get('座位', t)), ['前排', '前排']);
});

test('time-travel-kv · 延伸：与线性扫描对拍', () => {
  let seed = 26;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const m = new TimeMapAnyOrder();
  const log = new Map<string, Map<number, string>>();
  for (let i = 0; i < 500; i++) {
    const key = rand() < 0.5 ? 'a' : 'b';
    const t = Math.floor(rand() * 61);
    if (rand() < 0.5) {
      const value = `${key}${t}-${Math.floor(rand() * 10)}`;
      m.set(key, t, value);
      if (!log.has(key)) log.set(key, new Map());
      log.get(key)!.set(t, value);
    } else {
      const older = [...(log.get(key)?.keys() ?? [])].filter((s) => s <= t);
      const want = older.length ? log.get(key)!.get(Math.max(...older))! : null;
      assert.equal(m.get(key, t), want);
    }
  }
});
