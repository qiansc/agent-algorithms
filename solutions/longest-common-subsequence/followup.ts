export function lcsLength(a: string[], b: string[]): number {
  if (a.length < b.length) {
    [a, b] = [b, a]; // 让 b 是短的那个，两行数组的长度取 min(m, n) + 1
  }
  let prev = new Array<number>(b.length + 1).fill(0);
  for (const x of a) {
    const cur = new Array<number>(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (x === b[j - 1]) {
        cur[j] = prev[j - 1] + 1;
      } else {
        cur[j] = Math.max(prev[j], cur[j - 1]);
      }
    }
    prev = cur;
  }
  return prev[b.length];
}

/** 返回 [精确率, 召回率, F1]。按空白切词，大小写敏感。 */
export function rougeL(
  reference: string,
  candidate: string,
): [number, number, number] {
  const ref = reference.split(/\s+/).filter(Boolean);
  const cand = candidate.split(/\s+/).filter(Boolean);
  const hit = lcsLength(ref, cand);
  if (hit === 0) {
    return [0, 0, 0]; // 也覆盖了任一方为空的情况，避免除以 0
  }
  const precision = hit / cand.length; // 分母是模型输出的词数
  const recall = hit / ref.length; // 分母是参考答案的词数
  const f1 = (2 * precision * recall) / (precision + recall);
  return [precision, recall, f1];
}
