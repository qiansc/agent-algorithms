import math

Matrix = list[list[float]]


def matmul(a: Matrix, b: Matrix) -> Matrix:
    cols = list(zip(*b))  # b 的每一列
    return [
        [sum(x * y for x, y in zip(row, col)) for col in cols]
        for row in a
    ]


def multi_head_causal(
    x: Matrix,
    wq: Matrix,
    wk: Matrix,
    wv: Matrix,
    wo: Matrix,
    heads: int,
) -> Matrix:
    if not x:
        return []
    d_model = len(x[0])
    if heads <= 0 or d_model % heads:
        raise ValueError("heads must divide d_model")
    dh = d_model // heads
    q, k, v = matmul(x, wq), matmul(x, wk), matmul(x, wv)
    n = len(x)
    scale = math.sqrt(dh)  # 每个头的点积只有 dh 项，按 √dh 缩放
    concat: Matrix = [[] for _ in range(n)]
    for h in range(heads):
        lo, hi = h * dh, (h + 1) * dh  # 第 h 个头占第 lo..hi-1 列
        for i in range(n):
            scores = [
                sum(a * b for a, b in zip(q[i][lo:hi], k[j][lo:hi]))
                / scale
                for j in range(i + 1)
            ]
            peak = max(scores)
            weights = [math.exp(s - peak) for s in scores]
            total = sum(weights)
            out = [0.0] * dh
            for j, w in enumerate(weights):
                for c in range(dh):
                    out[c] += w / total * v[j][lo + c]
            concat[i].extend(out)  # 头按顺序左右拼接
    return matmul(concat, wo)
