import math


def group_advantages(groups: list[list[int]]) -> list[list[float]]:
    result: list[list[float]] = []
    for rewards in groups:
        n = len(rewards)
        if n == 0:
            result.append([])
            continue
        mean = sum(rewards) / n
        deviations = [r - mean for r in rewards]
        # 总体标准差：偏差平方的平均，除以 n 而不是 n - 1
        std = math.sqrt(sum(x * x for x in deviations) / n)
        if std == 0:
            result.append([0.0] * n)  # 组内全一样，看不出谁更好
        else:
            result.append([x / std for x in deviations])
    return result
