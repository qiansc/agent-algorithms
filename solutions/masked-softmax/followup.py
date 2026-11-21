import math


def action_log_probs(
    logits: list[float], allowed: list[bool], temperature: float
) -> list[float]:
    """返回 log 概率；非法动作是 -inf。"""
    if len(logits) != len(allowed):
        raise ValueError("logits 和 allowed 长度不同")
    if not temperature > 0:
        raise ValueError("温度必须大于 0")
    if not any(allowed):
        raise ValueError("没有可选的动作")
    peak = max(x for x, ok in zip(logits, allowed) if ok)
    scaled = [(x - peak) / temperature for x in logits]
    # log(总和) 在 0 到 log(合法动作数) 之间，不会溢出
    log_total = math.log(
        sum(math.exp(s) for s, ok in zip(scaled, allowed) if ok)
    )
    return [
        s - log_total if ok else -math.inf
        for s, ok in zip(scaled, allowed)
    ]
