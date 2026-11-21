from collections import Counter


def additive_penalties(
    logits: list[float],
    generated: list[int],
    frequency_penalty: float,
    presence_penalty: float,
) -> list[float]:
    """减法版惩罚：出现 c 次的编号减 c × frequency_penalty，
    只要出现过就再减一次 presence_penalty。"""
    if any(not 0 <= t < len(logits) for t in generated):
        raise ValueError("generated token id out of range")
    scores = list(logits)
    for t, c in Counter(generated).items():
        scores[t] -= c * frequency_penalty + presence_penalty
    return scores
