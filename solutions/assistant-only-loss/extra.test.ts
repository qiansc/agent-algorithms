import { test } from 'node:test';
import assert from 'node:assert/strict';
import { batchAssistantLoss } from './followup.ts';
import { assistantLoss } from './solution.ts';

const LN3 = Math.log(3);
const A: [number[][], number[]] = [
  [
    [0, 0],
    [0, LN3],
    [LN3, 0],
    [0, 0],
  ],
  [-100, -100, 1, 0],
];
const B: [number[][], number[]] = [
  [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [-100, 2],
];

test('assistant-only-loss · 延伸：一批对话按 token 平均', () => {
  const got = batchAssistantLoss([A, B]) as number;
  assert.ok(Math.abs(got - 0.6538861686744841) < 1e-12);
  assert.ok(Math.abs(got - 0.8369882167858357) > 0.1);
});

test('assistant-only-loss · 延伸：边界', () => {
  assert.equal(batchAssistantLoss([]), null);
  assert.equal(batchAssistantLoss([[[[0, 0]], [-100]]]), null);
  assert.ok(Math.abs((batchAssistantLoss([A]) as number) - 0.2876820724517809) < 1e-12);
  assert.ok(Math.abs((batchAssistantLoss([A, [[[0, 0]], [5]]]) as number) - 0.2876820724517809) < 1e-12);
});

test('assistant-only-loss · 词表 128256：不能用 Math.max(...row)', () => {
  const row = new Array<number>(128256).fill(0);
  const got = assistantLoss([row, row], [-100, 5]) as number;
  assert.ok(Math.abs(got - Math.log(128256)) < 1e-9);
});
