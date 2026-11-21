def token_bucket(times: list[int], w: int, limit: int) -> list[bool]:
    """令牌桶：容量 limit，每 w 秒匀速补 limit 个令牌，开始时是满的。

    每个请求拿走 1 个令牌，拿不到就拒绝。返回每个请求是否放行。
    """
    if w <= 0 or limit < 0:
        raise ValueError("w 必须是正整数，limit 不能为负")
    if any(a > b for a, b in zip(times, times[1:])):
        raise ValueError("时间必须按非递减顺序给出")
    # 以 1/w 个令牌为单位记账：令牌数乘以 w 后全是整数，没有浮点误差
    capacity = limit * w
    credit = capacity
    last = times[0] if times else 0
    result = []
    for t in times:
        # 每秒补 limit/w 个令牌，即 limit 个单位
        credit = min(capacity, credit + (t - last) * limit)
        last = t
        allowed = credit >= w  # 至少还有 1 个整令牌
        if allowed:
            credit -= w
        result.append(allowed)
    return result
