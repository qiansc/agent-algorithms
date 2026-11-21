def cheapest_checkout(
    required: int, prices: list[int], tiers: list[tuple[int, int]]
) -> tuple[int, list[int]]:
    """返回 (实付最少多少元, 要加的加购品下标，升序)。"""
    if required < 0 or any(p <= 0 for p in prices):
        raise ValueError("必点小计不能为负，加购品价格必须为正")
    for threshold, discount in tiers:
        if not 0 < discount <= threshold:
            raise ValueError(
                f"非法满减档 {(threshold, discount)}：要求 0 < 减额 <= 门槛"
            )

    def discount_of(total: int) -> int:
        # 只用一档：在已经够到的档里取减得最多的那档
        return max((d for t, d in tiers if t <= total), default=0)

    top = max((t for t, _ in tiers), default=0)
    if required >= top:
        # 不加菜就已经吃到所有档位，再加只会多花钱
        return required - discount_of(required), []

    # 格子 j 对应购物车总额 required + j；最后一格 cap 表示“总额 >= top”，
    # 那一格里保留实际总额最小的方案。
    # 每格存 (实际总额, 加购下标列表)，None 表示凑不出。
    cap = top - required
    best: list[tuple[int, list[int]] | None] = [None] * (cap + 1)
    best[0] = (required, [])

    def better(
        a: tuple[int, list[int]], b: tuple[int, list[int]] | None
    ) -> bool:
        # 先比总额（只有最后一格会不同），再比件数，最后比下标列表的字典序
        if b is None:
            return True
        return (a[0], len(a[1]), a[1]) < (b[0], len(b[1]), b[1])

    for i, price in enumerate(prices):
        # 从大往小扫，保证每件加购品最多用一次；最后一格不再往外扩，越加越贵
        for j in range(cap - 1, -1, -1):
            if best[j] is None:
                continue
            total, picked = best[j]
            k = min(j + price, cap)
            candidate = (total + price, picked + [i])
            if better(candidate, best[k]):
                best[k] = candidate

    answer: tuple[int, int, list[int]] | None = None
    for cell in best:
        if cell is None:
            continue
        total, picked = cell
        key = (total - discount_of(total), len(picked), picked)
        if answer is None or key < answer:
            answer = key
    assert answer is not None  # best[0] 一定存在
    return answer[0], answer[2]
