import math


def next_token_probs(
    logits: list[float],
    generated: list[int],
    penalty: float,
    temperature: float,
    k: int,
) -> list[float]:
    if not logits or penalty <= 0 or temperature <= 0 or k < 1:
        raise ValueError("bad logits, penalty, temperature or k")
    if any(not 0 <= t < len(logits) for t in generated):
        raise ValueError("generated token id out of range")
    scores = list(logits)
    # 1. 重复惩罚：每个出现过的编号只罚一次
    #    正分除、负分乘，都是往“更不可能”的方向推
    for t in set(generated):
        if scores[t] > 0:
            scores[t] /= penalty
        else:
            scores[t] *= penalty
    # 2. 温度
    scores = [s / temperature for s in scores]
    # 3. Top-k：严格小于第 k 大的才去掉，与它同分的全部保留
    kth = sorted(scores, reverse=True)[min(k, len(scores)) - 1]
    # 4. 在保留下来的分数上做稳定 softmax（最大分一定被保留）
    peak = max(scores)
    weights = [math.exp(s - peak) if s >= kth else 0.0 for s in scores]
    total = sum(weights)
    return [w / total for w in weights]
