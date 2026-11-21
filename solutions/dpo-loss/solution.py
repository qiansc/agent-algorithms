import math


def dpo_loss(
    policy_w: list[float],
    policy_l: list[float],
    ref_w: list[float],
    ref_l: list[float],
    beta: float,
) -> float:
    if not (policy_w and policy_l and ref_w and ref_l):
        raise ValueError("每个列表至少要有一个 token")
    if len(policy_w) != len(ref_w) or len(policy_l) != len(ref_l):
        raise ValueError("同一条回答在两个模型下的 token 数必须相同")
    if not beta > 0:
        raise ValueError("beta 必须大于 0")
    # 整条回答的对数概率 = 逐 token 条件对数概率之和
    policy_gap = sum(policy_w) - sum(policy_l)
    ref_gap = sum(ref_w) - sum(ref_l)
    margin = beta * (policy_gap - ref_gap)
    # -ln(sigmoid(m)) = ln(1 + e^(-m))；只对非正数取指数，m 很负时也不会溢出
    return max(-margin, 0.0) + math.log1p(math.exp(-abs(margin)))
