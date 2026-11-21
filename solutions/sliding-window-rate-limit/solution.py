from collections import deque


def allow_requests(times: list[int], w: int, limit: int) -> list[bool]:
    """对每个到达时刻 t，(t - w, t] 内放行的请求不能超过 limit 个。

    按输入顺序返回每个请求是否放行。
    """
    if w <= 0 or limit < 0:
        raise ValueError("w 必须是正整数，limit 不能为负")
    if any(a > b for a, b in zip(times, times[1:])):
        raise ValueError("时间必须按非递减顺序给出")
    active: deque[int] = deque()  # 只装已放行请求的时间，从早到晚
    result = []
    for t in times:
        # 时间 <= t - w 的请求已经不在 (t - w, t] 里
        while active and active[0] <= t - w:
            active.popleft()
        allowed = len(active) < limit
        result.append(allowed)
        if allowed:
            active.append(t)  # 被拒绝的请求不占名额
    return result
