Matrix = list[list[float]]


def lora_grads(
    A: Matrix,
    B: Matrix,
    alpha: float,
    x: list[float],
    grad_y: list[float],
) -> tuple[Matrix, Matrix]:
    """已知损失对输出 y 的梯度 grad_y，求损失对 A、B 的梯度。"""
    r = len(A)
    scale = alpha / r
    h = [sum(a * v for a, v in zip(row, x)) for row in A]  # h = A·x
    # y_i 含 scale·B[i][t]·h[t]，所以 dL/dB[i][t] = scale·g_i·h_t
    grad_B = [[scale * g * h[t] for t in range(r)] for g in grad_y]
    # dL/dh[t] = scale·Σ_i B[i][t]·g_i，再乘 x 得到 dL/dA[t][j]
    grad_h = [
        scale * sum(B[i][t] * g for i, g in enumerate(grad_y))
        for t in range(r)
    ]
    grad_A = [[gh * v for v in x] for gh in grad_h]
    return grad_A, grad_B
