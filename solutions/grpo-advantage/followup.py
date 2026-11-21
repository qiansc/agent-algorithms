import math


def group_advantages_eps(
    groups: list[list[float]], eps: float
) -> list[list[float]]:
    if eps <= 0:
        raise ValueError("eps 必须大于 0")
    result: list[list[float]] = []
    for rewards in groups:
        n = len(rewards)
        if n == 0:
            result.append([])
            continue
        mean = sum(rewards) / n
        deviations = [r - mean for r in rewards]
        std = math.sqrt(sum(x * x for x in deviations) / n)
        # 分母永远不小于 eps，全相同的组自然得到 0，不用单独判断
        result.append([x / (std + eps) for x in deviations])
    return result
