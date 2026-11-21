import { test } from 'node:test';
import assert from 'node:assert/strict';
import { infoNceWithIds } from './followup.ts';

const q = [[1, 0], [1, 0], [0, 1]];
const d = [[1, 0], [1, 0], [0, 1]];
const close = (a: number, b: number, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${a} != ${b}`);

test('info-nce · 延伸：同编号文档不当负例', () => {
  close(infoNceWithIds(q, d, [7, 7, 9], 1), 0.3926560297);
});

test('info-nce · 延伸：编号都不同时与原题一致', () => {
  close(infoNceWithIds(q, d, [1, 2, 3], 1), 0.7584781073);
  close(infoNceWithIds([[3, 0], [0, 1]], [[1, 0], [0, 2]], [0, 1], 1), Math.log(1 + Math.exp(-1)), 1e-12);
});

test('info-nce · 延伸：长度不一致要报错', () => {
  assert.throws(() => infoNceWithIds(q, d, [1, 2], 1));
});
