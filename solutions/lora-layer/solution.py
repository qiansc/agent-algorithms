Matrix = list[list[float]]


def matvec(m: Matrix, v: list[float]) -> list[float]:
    return [sum(a * b for a, b in zip(row, v)) for row in m]


class LoRALinear:
    """y = W·x + (alpha / r)·B·(A·x)。W 冻结，只训练 A 和 B。"""

    def __init__(
        self, W: Matrix, A: Matrix, B: Matrix, alpha: float
    ) -> None:
        d = len(W)
        k = len(W[0]) if W else 0
        r = len(A)
        if d == 0 or k == 0 or r == 0:
            raise ValueError("W and A must be non-empty")
        if any(len(row) != k for row in W + A):
            raise ValueError("W is d×k, A must be r×k")
        if len(B) != d or any(len(row) != r for row in B):
            raise ValueError("B must be d×r")
        self.W, self.A, self.B = W, A, B
        self.scale = alpha / r

    def forward(self, x: list[float]) -> list[float]:
        if len(x) != len(self.W[0]):
            raise ValueError("x must have length k")
        base = matvec(self.W, x)
        # 先算 A·x（只有 r 个数），再乘 B；不要先拼出 d×k 的 B·A
        low = matvec(self.B, matvec(self.A, x))
        return [b + self.scale * t for b, t in zip(base, low)]

    def merge(self) -> Matrix:
        """返回新矩阵 W' = W + scale·B·A，不改动 self.W。"""
        r = len(self.A)
        merged = []
        for w_row, b_row in zip(self.W, self.B):
            merged.append([
                w + self.scale * sum(b_row[t] * self.A[t][j]
                                     for t in range(r))
                for j, w in enumerate(w_row)
            ])
        return merged
