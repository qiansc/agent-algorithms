from solution import lower_bound


def lis_sequence(nums: list[int]) -> list[int]:
    tails: list[int] = []     # 同原题：每个长度的最小结尾值
    tail_idx: list[int] = []  # tail_idx[k]：这个结尾值在 nums 里的下标
    # parent[i]：nums[i] 接在哪个下标后面
    parent = [-1] * len(nums)
    for i, x in enumerate(nums):
        p = lower_bound(tails, x)
        if p > 0:
            parent[i] = tail_idx[p - 1]  # 接在“长度 p 的当前最佳结尾”后面
        if p == len(tails):
            tails.append(x)
            tail_idx.append(i)
        else:
            tails[p] = x
            tail_idx[p] = i
    out: list[int] = []
    i = tail_idx[-1] if tail_idx else -1
    while i != -1:  # 从最长那一条的结尾沿 parent 倒着走
        out.append(nums[i])
        i = parent[i]
    return out[::-1]
