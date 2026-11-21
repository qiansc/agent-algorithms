import math


def best_branches_exact(
    branches: list[tuple[int, int, int]], call_cap: int, token_cap: int
) -> int:
    """两项预算都必须恰好用完；做不到返回 -1。"""
    if call_cap < 0 or token_cap < 0:
        raise ValueError("预算不能为负")
    for calls, tokens, value in branches:
        if calls <= 0 or tokens <= 0 or value <= 0:
            raise ValueError(
                f"非法分支 {(calls, tokens, value)}：三项都要是正整数"
            )

    # best[c][t]：恰好用掉 c 次调用、t 单位 token 的最高分；凑不出来是负无穷
    best = [[-math.inf] * (token_cap + 1) for _ in range(call_cap + 1)]
    best[0][0] = 0
    for calls, tokens, value in branches:
        for c in range(call_cap, calls - 1, -1):
            for t in range(token_cap, tokens - 1, -1):
                take = best[c - calls][t - tokens] + value
                if take > best[c][t]:
                    best[c][t] = take
    answer = best[call_cap][token_cap]
    return -1 if answer == -math.inf else int(answer)
