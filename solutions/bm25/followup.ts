function countWords(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

// 按空白切词；和 Python 的 str.split() 一样，首尾空白不会产生空串
function split(text: string): string[] {
  return text.split(/\s+/).filter((t) => t !== '');
}

// classic 为 true：idf = ln((N-df+0.5)/(df+0.5))；否则在括号里加 1
export function bm25IdfVariant(
  docs: string[],
  query: string,
  classic: boolean,
  k1 = 1.2,
  b = 0.75,
): number[] {
  if (k1 < 0 || !(b >= 0 && b <= 1)) {
    throw new Error('要求 k1 >= 0 且 0 <= b <= 1');
  }
  const tokenized = docs.map(split);
  const n = tokenized.length;
  if (n === 0) return [];
  const totalLength = tokenized.reduce((s, t) => s + t.length, 0);
  const avgdl = totalLength / n;
  // 所有文档都是空的，没有词可以命中
  if (avgdl === 0) return new Array(n).fill(0);
  const df = new Map<string, number>(); // 词 -> 含有它的文档数
  for (const tokens of tokenized) {
    // 一篇文档里出现多次也只算一篇
    for (const w of new Set(tokens)) df.set(w, (df.get(w) ?? 0) + 1);
  }
  const words = [...new Set(split(query))]; // 查询词去重，保留原顺序
  return tokenized.map((tokens) => {
    const tf = countWords(tokens);
    // 长度系数，平均长度时为 1
    const norm = 1 - b + (b * tokens.length) / avgdl;
    let score = 0;
    for (const word of words) {
      const f = tf.get(word) ?? 0;
      if (f === 0) continue;
      const d = df.get(word)!;
      const ratio = (n - d + 0.5) / (d + 0.5);
      // 教科书写法在 df > N/2 时 ratio < 1，idf 变成负数
      const idf = classic ? Math.log(ratio) : Math.log(1 + ratio);
      score += (idf * f * (k1 + 1)) / (f + k1 * norm);
    }
    return score;
  });
}
