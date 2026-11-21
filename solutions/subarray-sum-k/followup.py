def longest_reward_span(rewards: list[int], k: int) -> int:
    """和为 k 的最长连续片段有多长；没有这样的片段返回 0。"""
    # 前缀和 -> 最早在第几步之后出现；-1 代表“一步都还没走”
    first = {0: -1}
    total = best = 0
    for i, reward in enumerate(rewards):
        total += reward
        if total - k in first:
            best = max(best, i - first[total - k])
        if total not in first:  # 只记第一次：起点越靠左，片段越长
            first[total] = i
    return best
