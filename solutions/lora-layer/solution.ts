type Matrix = number[][];

export function matvec(m: Matrix, v: number[]): number[] {
  return m.map((row) => row.reduce((s, a, j) => s + a * v[j], 0));
}

// y = W·x + (alpha / r)·B·(A·x)。W 冻结，只训练 A 和 B。
export class LoRALinear {
  W: Matrix;
  A: Matrix;
  B: Matrix;
  scale: number;

  constructor(W: Matrix, A: Matrix, B: Matrix, alpha: number) {
    const d = W.length;
    const k = d ? W[0].length : 0;
    const r = A.length;
    if (d === 0 || k === 0 || r === 0) {
      throw new Error('W and A must be non-empty');
    }
    if ([...W, ...A].some((row) => row.length !== k)) {
      throw new Error('W is d×k, A must be r×k');
    }
    if (B.length !== d || B.some((row) => row.length !== r)) {
      throw new Error('B must be d×r');
    }
    this.W = W;
    this.A = A;
    this.B = B;
    this.scale = alpha / r;
  }

  forward(x: number[]): number[] {
    if (x.length !== this.W[0].length) {
      throw new Error('x must have length k');
    }
    const base = matvec(this.W, x);
    // 先算 A·x（只有 r 个数），再乘 B；不要先拼出 d×k 的 B·A
    const low = matvec(this.B, matvec(this.A, x));
    return base.map((b, i) => b + this.scale * low[i]);
  }

  // 返回新矩阵 W' = W + scale·B·A，不改动 this.W。
  merge(): Matrix {
    const r = this.A.length;
    return this.W.map((wRow, i) =>
      wRow.map((w, j) => {
        let s = 0;
        for (let t = 0; t < r; t++) s += this.B[i][t] * this.A[t][j];
        return w + this.scale * s;
      }),
    );
  }
}
