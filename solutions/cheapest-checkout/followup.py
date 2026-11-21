def cheapest_checkout_stacked(
    required: int,
    prices: list[int],
    tiers: list[tuple[int, int]],
    coupon: tuple[int, int],
) -> tuple[int, list[int]]:
    """店铺满减之后再叠一张平台券：
    满减后仍 >= coupon[0] 元，再减 coupon[1] 元。"""
    coupon_at, coupon_off = coupon
    if required < 0 or any(p <= 0 for p in prices):
        raise ValueError("必点小计不能为负，加购品价格必须为正")
    for threshold, discount in [*tiers, coupon]:
        if not 0 < discount <= threshold:
            raise ValueError(
                f"非法满减档 {(threshold, discount)}：要求 0 < 减额 <= 门槛"
            )

    def paid_of(total: int) -> int:
        store_off = max((d for t, d in tiers if t <= total), default=0)
        after_store = total - store_off
        if after_store >= coupon_at:
            return after_store - coupon_off
        return after_store

    # 总额到了 top 之后店铺减额不再变；店铺减完还要 >= coupon_at 才能用券，
    # 所以价格函数最后一次往下跳的位置是 max(top, coupon_at + 最大减额)
    top = max((t for t, _ in tiers), default=0)
    max_off = max((d for _, d in tiers), default=0)
    last_drop = max(top, coupon_at + max_off)
    if required >= last_drop:
        return paid_of(required), []

    cap = last_drop - required
    best: list[tuple[int, list[int]] | None] = [None] * (cap + 1)
    best[0] = (required, [])
    for i, price in enumerate(prices):
        for j in range(cap - 1, -1, -1):
            if best[j] is None:
                continue
            total, picked = best[j]
            k = min(j + price, cap)
            candidate = (total + price, picked + [i])
            old = best[k]
            if old is None or (
                (candidate[0], len(candidate[1]), candidate[1])
                < (old[0], len(old[1]), old[1])
            ):
                best[k] = candidate

    answer = min(
        (paid_of(total), len(picked), picked)
        for total, picked in filter(None, best)
    )
    return answer[0], answer[2]
