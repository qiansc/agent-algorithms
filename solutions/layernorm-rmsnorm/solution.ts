function check(
  x: number[],
  eps: number,
  ...params: number[][]
): void {
  if (x.length === 0) throw new Error('x must not be empty');
  if (params.some((p) => p.length !== x.length)) {
    throw new Error('gamma / beta must match the length of x');
  }
  if (eps < 0) throw new Error('eps must be non-negative');
}

export function layerNorm(
  x: number[],
  gamma: number[],
  beta: number[],
  eps = 1e-5,
): number[] {
  check(x, eps, gamma, beta);
  const d = x.length;
  const mean = x.reduce((s, t) => s + t, 0) / d;
  // 总体方差：除以 d
  const variance = x.reduce((s, t) => s + (t - mean) ** 2, 0) / d;
  const std = Math.sqrt(variance + eps); // eps 加在根号里面
  if (std === 0) throw new Error('zero variance with eps = 0');
  return x.map((t, i) => (gamma[i] * (t - mean)) / std + beta[i]);
}

export function rmsNorm(
  x: number[],
  gamma: number[],
  eps = 1e-6,
): number[] {
  check(x, eps, gamma);
  // 不减均值，直接求平方的平均
  const rms = Math.sqrt(
    x.reduce((s, t) => s + t * t, 0) / x.length + eps,
  );
  if (rms === 0) throw new Error('all-zero input with eps = 0');
  return x.map((t, i) => (gamma[i] * t) / rms);
}
