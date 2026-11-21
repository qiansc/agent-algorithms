import math


def reward_model_loss(r_w: float, r_l: float) -> float:
    # Bradley–Terry：P(w 胜过 l) = sigmoid(r_w - r_l)，损失取负对数
    margin = r_w - r_l
    return max(-margin, 0.0) + math.log1p(math.exp(-abs(margin)))


def implicit_reward(
    policy: list[float], ref: list[float], beta: float
) -> float:
    # DPO 的隐式奖励：beta × (当前模型对数概率 - 参考模型对数概率)
    return beta * (sum(policy) - sum(ref))
