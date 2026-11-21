from solution import rope


def rope_score(
    q: list[float],
    k: list[float],
    m: float,
    n: float,
    base: float = 10000.0,
) -> float:
    """位置 m 的查询和位置 n 的键，各自旋转后的点积。"""
    if len(q) != len(k):
        raise ValueError("q and k must have the same length")
    rq, rk = rope(q, m, base), rope(k, n, base)
    return sum(a * b for a, b in zip(rq, rk))
