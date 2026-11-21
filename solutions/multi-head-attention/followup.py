import math

from solution import Matrix, matmul


def grouped_query_causal(
    x: Matrix,
    wq: Matrix,
    wk: Matrix,
    wv: Matrix,
    wo: Matrix,
    heads: int,
    groups: int,
) -> Matrix:
    """GQA：wq、wo 是 d×d；wk、wv 是 d×(groups·dh)。
    每 heads // groups 个查询头共用一组 K、V。"""
    if not x:
        return []
    d_model = len(x[0])
    if heads <= 0 or groups <= 0 or d_model % heads or heads % groups:
        raise ValueError("need heads | d_model and groups | heads")
    dh = d_model // heads
    per_group = heads // groups
    q = matmul(x, wq)
    k, v = matmul(x, wk), matmul(x, wv)  # 只有 groups·dh 列
    n = len(x)
    scale = math.sqrt(dh)
    concat: Matrix = [[] for _ in range(n)]
    for h in range(heads):
        q_lo = h * dh
        kv_lo = (h // per_group) * dh  # 唯一的改动：K、V 按组取列
        for i in range(n):
            scores = [
                sum(q[i][q_lo + c] * k[j][kv_lo + c] for c in range(dh))
                / scale
                for j in range(i + 1)
            ]
            peak = max(scores)
            weights = [math.exp(s - peak) for s in scores]
            total = sum(weights)
            out = [0.0] * dh
            for j, w in enumerate(weights):
                for c in range(dh):
                    out[c] += w / total * v[j][kv_lo + c]
            concat[i].extend(out)
    return matmul(concat, wo)
