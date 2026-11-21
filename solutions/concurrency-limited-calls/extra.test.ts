import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gatherLimited, Semaphore, simulate } from './followup.ts';
import { runLimited } from './solution.ts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

test('concurrency-limited-calls · 延伸：真实计时的完成顺序与堆模拟一致', async () => {
  // 完成时刻两两相差至少 2 个单位；每单位 100 毫秒，机器繁忙时计时器的延迟也盖不过这个间隔
  const durations = [9, 1, 2, 2, 2];
  const [, order] = runLimited(durations, 2);
  assert.deepEqual(order, [1, 2, 3, 4, 0]);
  assert.deepEqual(await simulate(durations, 2, 100), order);
});

test('concurrency-limited-calls · 延伸：同时最多 limit 个，按提交顺序启动', async () => {
  let active = 0;
  let peak = 0;
  const started: number[] = [];
  const jobs = Array.from({ length: 7 }, (_, i) => async () => {
    active += 1;
    peak = Math.max(peak, active);
    started.push(i);
    await sleep(10);
    active -= 1;
    return i * i;
  });
  const result = await gatherLimited(jobs, 3);
  assert.deepEqual(result, [0, 1, 4, 9, 16, 25, 36]);
  assert.equal(peak, 3);
  assert.deepEqual(started, [0, 1, 2, 3, 4, 5, 6]);
});

test('concurrency-limited-calls · 延伸：调用失败也会归还名额', async () => {
  const log: string[] = [];
  const fail = async (): Promise<string> => {
    throw new Error('tool failed');
  };
  const ok = async (): Promise<string> => {
    log.push('ok');
    return 'ok';
  };
  await assert.rejects(gatherLimited([fail, ok], 1));
  await sleep(20); // 等后面那个调用拿到名额
  assert.deepEqual(log, ['ok']);
});

test('concurrency-limited-calls · 延伸：limit 非法', () => {
  assert.throws(() => new Semaphore(0), RangeError);
});
