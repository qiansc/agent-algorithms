import { test } from 'node:test';
import assert from 'node:assert/strict';
import { implicitReward, rewardModelLoss } from './followup.ts';
import { dpoLoss } from './solution.ts';

const close = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} vs ${b}`);

test('dpo-loss · 延伸：Bradley–Terry 损失', () => {
  close(rewardModelLoss(0, 0), Math.log(2));
  close(rewardModelLoss(1, 0), 0.31326168751822286);
  close(rewardModelLoss(2, 3), 1.3132616875182228);
  assert.equal(rewardModelLoss(-800, 0), 800);
});

test('dpo-loss · 延伸：DPO 等于隐式奖励上的 Bradley–Terry 损失', () => {
  const rW = implicitReward([-1, -1], [-1, -2], 1);
  const rL = implicitReward([-2, -2], [-2, -2], 1);
  assert.deepEqual([rW, rL], [1, 0]);
  close(rewardModelLoss(rW, rL), dpoLoss([-1, -1], [-2, -2], [-1, -2], [-2, -2], 1));
  let seed = 7;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const draw = (n: number) => Array.from({ length: n }, () => -5 * rand());
  for (let t = 0; t < 200; t++) {
    const pw = draw(1 + Math.floor(rand() * 6));
    const pl = draw(1 + Math.floor(rand() * 6));
    const rw = draw(pw.length);
    const rl = draw(pl.length);
    const beta = 0.05 + 1.95 * rand();
    close(rewardModelLoss(implicitReward(pw, rw, beta), implicitReward(pl, rl, beta)), dpoLoss(pw, pl, rw, rl, beta));
  }
});
