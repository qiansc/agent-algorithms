export type Row = [number[], number]; // [token 列表, 词频]
export type Pair = [number, number];

// 数对的字典序：先比第一个数，再比第二个数，都按数值比较
function lessPair(p: Pair, q: Pair): boolean {
  return p[0] < q[0] || (p[0] === q[0] && p[1] < q[1]);
}

export function mergeOnce(
  rows: Row[],
  newId: number,
): [Pair | null, Row[]] {
  for (const [, freq] of rows) {
    if (!Number.isInteger(freq) || freq <= 0) {
      throw new Error('frequency must be a positive integer');
    }
  }
  // 第一遍：计票。相邻位置可以重叠，[1, 1, 1] 里有两对 (1, 1)
  // Map 的键用字符串 "a,b"：数组作键时比较的是引用，不是内容
  const counts = new Map<string, number>();
  for (const [tokens, freq] of rows) {
    for (let i = 0; i + 1 < tokens.length; i++) {
      const key = `${tokens[i]},${tokens[i + 1]}`;
      counts.set(key, (counts.get(key) ?? 0) + freq);
    }
  }
  if (counts.size === 0) return [null, rows];
  // 票数最高；并列时取数对字典序最小的（按数值比较，不按字符串）
  let pair: Pair | null = null;
  let best = -1;
  for (const [key, c] of counts) {
    const p = key.split(',').map(Number) as Pair;
    if (pair === null || c > best || (c === best && lessPair(p, pair))) {
      pair = p;
      best = c;
    }
  }
  const [a, b] = pair as Pair;
  // 第二遍：每行从左到右替换，一个 token 只能用一次
  const merged: Row[] = rows.map(([tokens, freq]) => {
    const out: number[] = [];
    let i = 0;
    while (i < tokens.length) {
      const next = i + 1 < tokens.length ? tokens[i + 1] : null;
      if (tokens[i] === a && next === b) {
        out.push(newId);
        i += 2;
      } else {
        out.push(tokens[i]);
        i += 1;
      }
    }
    return [out, freq];
  });
  return [pair, merged];
}
