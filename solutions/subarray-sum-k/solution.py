def count_reward_spans(rewards: list[int], k: int) -> int:
    if not all(isinstance(x, int) for x in [*rewards, k]):
        raise ValueError("rewards 和 k 都必须是整数")
    # 前缀和 -> 出现过几次；0 代表“一步都还没走”
    count = {0: 1}
    total = answer = 0
    for reward in rewards:
        total += reward
        # 先查：以这步结尾、和为 k 的片段，起点前的前缀和必须是 total - k
        answer += count.get(total - k, 0)
        # 再记：顺序反过来，k = 0 时会把当前位置和它自己配对
        count[total] = count.get(total, 0) + 1
    return answer
