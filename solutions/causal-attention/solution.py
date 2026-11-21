import math


def causal_attention(
    q: list[list[float]], k: list[list[float]], v: list[list[float]]
) -> list[list[float]]:
    n = len(q)
    if len(k) != n or len(v) != n:
        raise ValueError("Q, K, V must have the same number of rows")
    if n == 0:
        return []
    scale = math.sqrt(len(q[0]))  # √d，d 是 Q、K 每行的长度
    out: list[list[float]] = []
    for i, query in enumerate(q):
        # 第 i 行只和第 0..i 行的 K 打分：未来位置根本不进入 softmax
        scores = [
            sum(a * b for a, b in zip(query, k[j])) / scale
            for j in range(i + 1)
        ]
        peak = max(scores)
        weights = [math.exp(s - peak) for s in scores]
        total = sum(weights)
        row = [0.0] * len(v[0])
        for j, w in enumerate(weights):
            for c, value in enumerate(v[j]):
                row[c] += w / total * value
        out.append(row)
    return out
