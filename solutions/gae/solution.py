def gae(
    rewards: list[float],
    values: list[float],
    last_value: float,
    gamma: float,
    lam: float,
) -> list[float]:
    if len(rewards) != len(values):
        raise ValueError("rewards 和 values 必须等长")
    if not (0 <= gamma <= 1 and 0 <= lam <= 1):
        raise ValueError("gamma 和 lam 必须在 [0, 1] 内")
    n = len(rewards)
    advantages = [0.0] * n
    running = 0.0  # 后一步的优势 A[t+1]，最后一步之后视为 0
    for t in range(n - 1, -1, -1):
        next_value = values[t + 1] if t + 1 < n else last_value
        delta = rewards[t] + gamma * next_value - values[t]  # TD 误差
        running = delta + gamma * lam * running
        advantages[t] = running
    return advantages
