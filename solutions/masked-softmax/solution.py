import math


def action_probs(
    logits: list[float], allowed: list[bool], temperature: float
) -> list[float]:
    if len(logits) != len(allowed):
        raise ValueError("logits 和 allowed 长度不同")
    if not temperature > 0:
        raise ValueError("温度必须大于 0")
    if not any(allowed):
        raise ValueError("没有可选的动作")
    # 只在合法动作里取最大值；减掉它以后最大的指数项是 exp(0) = 1
    peak = max(x for x, ok in zip(logits, allowed) if ok)
    weights = [
        math.exp((x - peak) / temperature) if ok else 0.0
        for x, ok in zip(logits, allowed)
    ]
    total = sum(weights)  # 至少是 1，不会除以 0
    return [w / total for w in weights]
