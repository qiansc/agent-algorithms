export function rope(
  vec: number[],
  pos: number,
  base = 10000,
): number[] {
  const d = vec.length;
  if (d % 2 !== 0) throw new RangeError('dimension must be even');
  const out = [...vec];
  for (let j = 0; j < d / 2; j++) {
    // 第 j 对是 (vec[2j], vec[2j+1])
    const theta = pos * base ** ((-2 * j) / d);
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const x = vec[2 * j];
    const y = vec[2 * j + 1];
    // 两个新值都用旧的 x、y 算
    out[2 * j] = x * c - y * s;
    out[2 * j + 1] = x * s + y * c;
  }
  return out;
}
