import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TagFilter, thinkFilter, toolCallFilter } from './followup.ts';
import { ThinkFilter } from './solution.ts';

type Feedable = { feed(c: string): string; close(): string };
const run = (f: Feedable, chunks: string[]) => [...chunks.map((c) => f.feed(c)), f.close()];

// 整段文本一次性处理的结果，用来对拍
function reference(text: string, start: string, end: string, keepInside: boolean): string {
  const pieces: string[] = [];
  let pos = 0;
  let inside = false;
  while (true) {
    const tag = inside ? end : start;
    const i = text.indexOf(tag, pos);
    if (i < 0) {
      if (inside === keepInside) pieces.push(text.slice(pos));
      return pieces.join('');
    }
    if (inside === keepInside) pieces.push(text.slice(pos, i));
    pos = i + tag.length;
    inside = !inside;
  }
}

// 固定种子的小随机数发生器（mulberry32），保证每次跑的数据一样
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('streaming-think-filter · 延伸：只输出 tool_call 里面的内容', () => {
  assert.deepEqual(run(toolCallFilter(), ['查一下。<tool_', 'call>{"q": 1}</tool', '_call>好的']), ['', '{"q": 1}', '', '']);
  assert.deepEqual(run(toolCallFilter(), ['<tool_call>a</tool_call>x<tool_call>b</tool_call>']), ['ab', '']);
  assert.deepEqual(run(toolCallFilter(), ['a <tool']), ['', '']);
});

test('streaming-think-filter · 延伸：参数化版本与原题一致', () => {
  for (const chunks of [['Hi <th', 'ink>secret</thi', 'nk> there'], ['1 < 2 <']]) {
    assert.deepEqual(run(thinkFilter(), chunks), run(new ThinkFilter(), chunks));
  }
  assert.throws(() => new TagFilter('', '</x>', true));
});

test('streaming-think-filter · 随机切分，两种模式都与整段处理一致', () => {
  const rand = rng(50);
  const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  for (const [start, end] of [['<think>', '</think>'], ['<tool_call>', '</tool_call>']]) {
    const alphabet = [...new Set(start + end + 'ab ')];
    for (let n = 0; n < 300; n++) {
      const parts: string[] = [];
      const count = Math.floor(rand() * 13);
      for (let j = 0; j < count; j++) {
        const r = rand();
        if (r < 0.2) parts.push(start);
        else if (r < 0.4) parts.push(end);
        else parts.push(Array.from({ length: 1 + Math.floor(rand() * 5) }, () => pick(alphabet)).join(''));
      }
      const text = parts.join('');
      const chunks: string[] = [];
      for (let i = 0; i < text.length; ) {
        const k = 1 + Math.floor(rand() * 6);
        chunks.push(text.slice(i, i + k));
        i += k;
      }
      for (const keepInside of [false, true]) {
        const got = run(new TagFilter(start, end, keepInside), chunks).join('');
        assert.equal(got, reference(text, start, end, keepInside), JSON.stringify(chunks));
      }
    }
  }
});
