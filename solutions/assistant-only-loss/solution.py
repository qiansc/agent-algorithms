import math

IGNORE = -100


def assistant_loss(
    logits: list[list[float]], labels: list[int]
) -> float | None:
    if len(logits) != len(labels):
        raise ValueError("logits and labels differ in length")
    total = 0.0
    count = 0
    # logits[j - 1] 是读完位置 j - 1 后对下一个 token 的打分，
    # 它要预测的是 labels[j]；位置 0 没有上一行来预测它
    for j in range(1, len(labels)):
        target = labels[j]
        if target == IGNORE:
            continue
        scores = logits[j - 1]
        # Python 的负下标不会报错，越界的标签要自己拦下来
        if not 0 <= target < len(scores):
            raise ValueError(f"label {target} out of range")
        peak = max(scores)
        # -log p = (peak - 正确分) + log Σ exp(分数 - peak)，不会溢出
        z = sum(math.exp(s - peak) for s in scores)
        total += (peak - scores[target]) + math.log(z)
        count += 1
    return total / count if count else None
