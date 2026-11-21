import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenBucket } from './followup.ts';
import { allowRequests } from './solution.ts';

function brute(times: number[], w: number, limit: number): boolean[] {
  const accepted: number[] = [];
  return times.map((t) => {
    const ok = accepted.filter((a) => t - w < a && a <= t).length < limit;
    if (ok) accepted.push(t);
    return ok;
  });
}

test('sliding-window-rate-limit · 与逐个数窗口的写法对拍', () => {
  let s = 26;
  const rnd = (lo: number, hi: number) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return lo + (s % (hi - lo + 1));
  };
  for (let k = 0; k < 500; k++) {
    const times = Array.from({ length: rnd(0, 12) }, () => rnd(0, 30)).sort((a, b) => a - b);
    const w = rnd(1, 10);
    const limit = rnd(0, 4);
    assert.deepEqual(allowRequests(times, w, limit), brute(times, w, limit));
  }
});

test('sliding-window-rate-limit · 延伸：令牌桶的样例', () => {
  assert.deepEqual(tokenBucket([0, 0, 59, 59, 60, 60, 60], 60, 3), [true, true, true, true, true, false, false]);
});

test('sliding-window-rate-limit · 延伸：令牌桶的边界', () => {
  assert.deepEqual(tokenBucket([], 60, 3), []);
  assert.deepEqual(tokenBucket([1, 2], 5, 0), [false, false]);
  assert.deepEqual(tokenBucket([0, 0, 0, 4, 5, 10, 10], 10, 2), [true, true, false, false, true, true, false]);
  assert.throws(() => tokenBucket([1], 0, 3));
  assert.throws(() => tokenBucket([1], 60, -1));
  assert.throws(() => tokenBucket([5, 3], 60, 3));
});

test('sliding-window-rate-limit · 延伸：长时间的放行总数', () => {
  const times = Array.from({ length: 600 }, (_, i) => i);
  assert.equal(tokenBucket(times, 60, 3).filter(Boolean).length, 32);
  assert.equal(allowRequests(times, 60, 3).filter(Boolean).length, 30);
});
