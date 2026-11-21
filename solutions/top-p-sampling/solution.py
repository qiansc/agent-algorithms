# 累加时的浮点容差：0.7 + 0.1 + 0.1 会算成 0.8999999999999999
EPS = 1e-12


def nucleus_draw(probs: list[float], p: float, u: float) -> int:
    if not probs or not 0 < p <= 1 or not 0 <= u < 1:
        raise ValueError("need probs, 0 < p <= 1, 0 <= u < 1")
    if any(x < 0 for x in probs):
        raise ValueError("probabilities must be non-negative")
    # 概率降序；同概率时编号小的在前
    order = sorted(range(len(probs)), key=lambda i: (-probs[i], i))
    kept: list[int] = []
    mass = 0.0
    for i in order:
        if probs[i] == 0:
            break
        kept.append(i)
        mass += probs[i]
        if mass >= p - EPS:  # 跨过阈值的这一个也要留下
            break

    point = u * mass  # 把 u 缩放到保留部分的总长度，省掉归一化
    boundary = 0.0
    for i in kept:
        boundary += probs[i]
        if point < boundary:  # 区间左闭右开
            return i
    return kept[-1]  # 浮点误差可能让 point 恰好等于右端点
