def dual_clip_loss(
    old: list[float],
    new: list[float],
    adv: list[float],
    eps: float,
    c: float,
) -> float:
    n = len(adv)
    if n == 0 or len(old) != n or len(new) != n:
        raise ValueError("三列必须等长且非空")
    if not 0 < eps < 1 or c <= 1:
        raise ValueError("要求 0 < eps < 1 且 c > 1")
    objective = 0.0
    for previous, current, advantage in zip(old, new, adv):
        if not (0 < previous <= 1 and 0 < current <= 1):
            raise ValueError("概率必须在 (0, 1] 内")
        ratio = current / previous
        clipped = min(1 + eps, max(1 - eps, ratio))
        term = min(ratio * advantage, clipped * advantage)
        if advantage < 0:
            term = max(term, c * advantage)  # 负优势的惩罚最多算到 c 倍
        objective += term
    return -objective / n
