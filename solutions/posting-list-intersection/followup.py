from bisect import bisect_left


def intersect_short_long(
    short: list[int], long: list[int]
) -> list[int]:
    """short 的每个编号都到 long 里二分查找。"""
    common: list[int] = []
    lo = 0  # long[:lo] 都小于上一个查过的编号，下次不用再找
    for doc in short:
        lo = bisect_left(long, doc, lo)
        if lo == len(long):
            break  # 后面的编号更大，long 里不会再有
        if long[lo] == doc:
            common.append(doc)
            lo += 1
    return common
