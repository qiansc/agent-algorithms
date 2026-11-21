from bisect import bisect_right


def best_window_value(jobs: list[tuple[int, int, int]]) -> int:
    for start, end, value in jobs:
        if start >= end or value <= 0:
            raise ValueError(
                f"非法任务 {(start, end, value)}："
                "要求 start < end、value > 0"
            )

    # 按结束时间排；sorted 是稳定排序
    ordered = sorted(jobs, key=lambda job: job[1])
    ends = [end for _, end, _ in ordered]
    # best[i]：只看结束最早的前 i 个任务，能拿到的最大收益
    best = [0] * (len(ordered) + 1)
    for i, (start, end, value) in enumerate(ordered):
        # 前 i 个任务里结束时间 <= start 的个数；
        # 首尾相接（end == start）也算不冲突
        eligible = bisect_right(ends, start, 0, i)
        best[i + 1] = max(best[i], best[eligible] + value)
    return best[-1]
