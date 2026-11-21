def lower_bound(tails: list[int], x: int) -> int:
    """tails 递增，返回第一个 >= x 的位置；都比 x 小时返回 len(tails)。"""
    lo, hi = 0, len(tails)
    while lo < hi:
        mid = (lo + hi) // 2
        if tails[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo


def lis_length(nums: list[int]) -> int:
    # tails[k]：长度为 k + 1 的递增子序列里，最小的结尾值
    tails: list[int] = []
    for x in nums:
        p = lower_bound(tails, x)
        if p == len(tails):
            tails.append(x)  # 比所有结尾都大，最长长度加 1
        else:
            tails[p] = x     # 长度 p + 1 的结尾换成更小的 x
    return len(tails)
