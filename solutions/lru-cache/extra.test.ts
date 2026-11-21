import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LRUCacheShort } from './followup.ts';
import { LRUCache } from './solution.ts';

type Call = [string, unknown[]];
const spec = JSON.parse(readFileSync(new URL('./cases.json', import.meta.url), 'utf8')) as {
  cases: { name: string; init: [number]; calls: Call[]; expected: unknown[] }[];
};

function run(cache: Record<string, any>, calls: Call[]): unknown[] {
  return calls.map(([method, args]) => cache[method](...args) ?? null);
}

test('lru-cache · 延伸：Map 版与样例一致', () => {
  for (const c of spec.cases) {
    assert.deepEqual(run(new LRUCacheShort(c.init[0]), c.calls), c.expected, c.name);
  }
});

test('lru-cache · 延伸：Map 版与链表版对拍', () => {
  let seed = 25;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let round = 0; round < 300; round++) {
    const capacity = Math.floor(rand() * 5);
    const calls: Call[] = [];
    for (let i = 0; i < 40; i++) {
      const key = 'ABCDEF'[Math.floor(rand() * 6)];
      calls.push(rand() < 0.5 ? ['get', [key]] : ['put', [key, Math.floor(rand() * 10)]]);
    }
    assert.deepEqual(
      run(new LRUCacheShort(capacity), calls),
      run(new LRUCache(capacity), calls),
    );
  }
});

test('lru-cache · 容量为负时抛错', () => {
  assert.throws(() => new LRUCache(-1), RangeError);
  assert.throws(() => new LRUCacheShort(-1), RangeError);
});
