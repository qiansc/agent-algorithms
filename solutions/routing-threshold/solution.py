import math
from itertools import groupby


def best_threshold(
    samples: list[tuple[float, int]], fp: int, fn: int
) -> tuple[float, int]:
    if fp < 0 or fn < 0:
        raise ValueError("代价必须是非负数")
    for score, label in samples:
        if not math.isfinite(score) or label not in (0, 1):
            raise ValueError("分数必须是有限实数，标签只能是 0 或 1")
    rows = sorted(samples, key=lambda row: row[0], reverse=True)
    # 阈值为 +inf 时一个都不调用：每个正例都是一次漏调用
    loss = sum(label for _, label in rows) * fn
    best_t, best_loss = math.inf, loss
    # 阈值从高往低移动，同分的一批必须一起越过
    for score, group in groupby(rows, key=lambda row: row[0]):
        for _, label in group:
            # 正例：漏调变命中；负例：多一次误调用
            loss += -fn if label == 1 else fp
        if loss < best_loss:  # 严格变小才更新，平分时保留更高的阈值
            best_t, best_loss = score, loss
    return best_t, best_loss
