def best_branches(
    branches: list[tuple[int, int, int]], call_cap: int, token_cap: int
) -> int:
    if call_cap < 0 or token_cap < 0:
        raise ValueError("预算不能为负")
    for calls, tokens, value in branches:
        if calls <= 0 or tokens <= 0 or value <= 0:
            raise ValueError(
                f"非法分支 {(calls, tokens, value)}：三项都要是正整数"
            )

    # best[c][t]：已看过的分支里，
    # 最多用 c 次调用、t 单位 token 能拿到的最高分
    best = [[0] * (token_cap + 1) for _ in range(call_cap + 1)]
    for calls, tokens, value in branches:
        # 两个预算都从大往小扫：
        # 读到的 best[c - calls][t - tokens] 还是“没看这个分支”时的值
        for c in range(call_cap, calls - 1, -1):
            for t in range(token_cap, tokens - 1, -1):
                take = best[c - calls][t - tokens] + value
                if take > best[c][t]:
                    best[c][t] = take
    return best[call_cap][token_cap]
