// 分数 num / den，分母恒为正，并且已约到最简
interface Rational {
  num: bigint;
  den: bigint;
}

function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) [a, b] = [b, a % b];
  return a < 0n ? -a : a;
}

function add(x: Rational, y: Rational): Rational {
  const num = x.num * y.den + y.num * x.den;
  const den = x.den * y.den;
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

// 交叉相乘比较大小：x < y 返回负数，相等返回 0。分母为正，不等号不变向
function compare(x: Rational, y: Rational): number {
  const lhs = x.num * y.den;
  const rhs = y.num * x.den;
  return lhs < rhs ? -1 : lhs > rhs ? 1 : 0;
}

export function fuseRanks(
  ranks: number[][],
  k: number,
  c = 60,
): number[] {
  if (!Number.isInteger(c) || c < 1) throw new Error('c 必须是正整数');
  if (k < 0) throw new Error('k 不能是负数');
  if (k === 0) return [];
  // 用分数精确累加：数学上相等的总分一定比较为相等，并列才能按编号排
  const scores = new Map<number, Rational>();
  for (const ranking of ranks) {
    ranking.forEach((doc, i) => {
      const pos = i + 1; // 名次从 1 数
      const gain = { num: 1n, den: BigInt(c + pos) };
      const old = scores.get(doc) ?? { num: 0n, den: 1n };
      scores.set(doc, add(old, gain));
    });
  }
  const docs = [...scores.keys()].sort(
    (a, b) => compare(scores.get(b)!, scores.get(a)!) || a - b,
  );
  return docs.slice(0, k);
}
