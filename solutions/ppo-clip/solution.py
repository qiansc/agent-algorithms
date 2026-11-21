def clipped_policy_loss(
    old: list[float], new: list[float], adv: list[float], eps: float
) -> float:
    n = len(adv)
    if n == 0 or len(old) != n or len(new) != n:
        raise ValueError("三列必须等长且非空")
    if not 0 < eps < 1:
        raise ValueError("eps 必须在 (0, 1) 内")
    objective = 0.0
    for previous, current, advantage in zip(old, new, adv):
        if not (0 < previous <= 1 and 0 < current <= 1):
            raise ValueError("概率必须在 (0, 1] 内")
        ratio = current / previous
        clipped = min(1 + eps, max(1 - eps, ratio))
        # 两项取小：好处最多拿到裁剪边界，坏处一分不打折
        objective += min(ratio * advantage, clipped * advantage)
    return -objective / n  # 目标要最大化，取负号交给梯度下降
