def max_on_time_value(orders: list[list[int]]) -> int:
    """orders[i] = [d, D, v]：时长 d、截止时间 D、价值 v。

    返回准时完成的订单价值之和的最大值。
    """
    for order in orders:
        if len(order) != 3:
            raise ValueError("每一单必须是 [d, D, v]")
        d, deadline, value = order
        if d < 1 or deadline < 0 or value < 0:
            raise ValueError("d 至少为 1，D 和 v 不能为负")
    horizon = max((o[1] for o in orders), default=0)
    # best[t]：已选订单总时长恰好为 t 时的最大价值，None 表示凑不出
    best: list[int | None] = [0] + [None] * horizon
    for d, deadline, value in sorted(orders, key=lambda o: o[1]):
        # 这一单排在已选订单之后，回到店里的时刻 t 不能超过 D；
        # t 从大到小走，保证每单只用一次
        for t in range(deadline, d - 1, -1):
            prev = best[t - d]
            if prev is None:
                continue
            if best[t] is None or prev + value > best[t]:
                best[t] = prev + value
    return max(v for v in best if v is not None)
