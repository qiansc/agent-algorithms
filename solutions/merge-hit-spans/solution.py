Hit = tuple[int, int, int]  # (文档, 起点, 终点)


def merge_hits(hits: list[Hit]) -> list[Hit]:
    for _, start, end in hits:
        if start >= end:
            raise ValueError("each hit needs start < end")
    merged: list[Hit] = []
    # 按 (文档, 起点, 终点) 排序：同一文档挨在一起，起点升序
    for doc, start, end in sorted(hits):
        if merged and merged[-1][0] == doc and start <= merged[-1][2]:
            # 重叠或首尾相接都并进去；终点取较大者
            _, prev_start, prev_end = merged[-1]
            merged[-1] = (doc, prev_start, max(prev_end, end))
        else:
            merged.append((doc, start, end))
    return merged
