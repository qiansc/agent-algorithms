from bisect import bisect_right


def best_window_value_k(jobs: list[tuple[int, int, int]], k: int) -> int:
    """最多只接 k 个任务时的最大收益。"""
    if k < 0:
        raise ValueError("k 不能为负")
    for start, end, value in jobs:
        if start >= end or value <= 0:
            raise ValueError(
                f"非法任务 {(start, end, value)}："
                "要求 start < end、value > 0"
            )

    ordered = sorted(jobs, key=lambda job: job[1])
    ends = [end for _, end, _ in ordered]
    # best[i][c]：只看前 i 个任务、最多接 c 个时的最大收益
    best = [[0] * (k + 1) for _ in range(len(ordered) + 1)]
    for i, (start, end, value) in enumerate(ordered):
        eligible = bisect_right(ends, start, 0, i)
        for c in range(1, k + 1):
            # 接下第 i 个任务就用掉一个名额，前面只剩 c - 1 个
            take = best[eligible][c - 1] + value
            best[i + 1][c] = max(best[i][c], take)
    return best[-1][k]
