import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bm25IdfVariant } from './followup.ts';
import { bm25 } from './solution.ts';

const DOCS = ['cat sat mat', 'dog sat log', 'cat cat ran far away'];

function close(a: number[], b: number[]) {
  assert.equal(a.length, b.length);
  a.forEach((x, i) => assert.ok(Math.abs(x - b[i]) < 1e-9, `${x} vs ${b[i]}`));
}

test('bm25 · 延伸：加 1 的写法与主解一致', () => {
  close(bm25IdfVariant(DOCS, 'cat sat', false), bm25(DOCS, 'cat sat'));
});

test('bm25 · 延伸：教科书 idf 让次序整个颠倒', () => {
  close(bm25IdfVariant(DOCS, 'cat sat', true), [-1.1037482227800874, -0.5518741113900437, -0.6372154688214936]);
});

test('bm25 · 延伸：不含查询词的文档反而排第一', () => {
  const docs = ['cat sat', 'cat ran', 'cat dog', 'bird flew'];
  const got = bm25IdfVariant(docs, 'cat', true);
  assert.equal(got[3], 0);
  assert.ok(got.slice(0, 3).every((x) => x < 0));
  close(bm25IdfVariant(docs, 'cat', false).slice(0, 3), [0.3566749439387324, 0.3566749439387324, 0.3566749439387324]);
});
