import heapq


def run_limited(
    durations: list[int], limit: int
) -> tuple[list[int], list[int]]:
    if limit < 1:
        raise ValueError("limit must be >= 1")
    if any(d <= 0 for d in durations):
        raise ValueError("durations must be positive")
    # 每个空位下一次空出来的时刻；调用比空位少时，多余的空位用不上
    free_at = [0] * min(limit, len(durations))
    finish: list[int] = []
    for d in durations:
        start = heapq.heappop(free_at)  # 最早空出来的那个位置
        finish.append(start + d)
        heapq.heappush(free_at, start + d)
    # 完成顺序：先按完成时刻，同一时刻按下标
    order = sorted(range(len(durations)), key=lambda i: (finish[i], i))
    return finish, order
