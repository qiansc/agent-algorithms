def chunk_sentences(
    lengths: list[int], size: int, overlap: int
) -> list[tuple[int, int]]:
    """lengths[i] 是第 i 句的 token 数。

    返回每块包含的句子区间 [first, end)。
    """
    if size <= 0 or not 0 <= overlap < size:
        raise ValueError("need 0 <= overlap < size")
    if any(x <= 0 for x in lengths):
        raise ValueError("sentence lengths must be positive")
    n = len(lengths)
    spans: list[tuple[int, int]] = []
    start = 0
    while start < n:
        end, total = start, 0
        while end < n and total + lengths[end] <= size:
            total += lengths[end]  # 能装下就整句装进来
            end += 1
        if end == start:
            end = start + 1  # 这一句本身超过 size，单独成块
        spans.append((start, end))
        if end == n:
            break
        # 从块尾往回带整句给下一块：带上的总长不超过 overlap，
        # 带上之后还要装得下第 end 句，并且不能退回到本块开头
        nxt, carried = end, 0
        while (
            nxt - 1 > start
            and carried + lengths[nxt - 1] <= overlap
            and carried + lengths[nxt - 1] + lengths[end] <= size
        ):
            nxt -= 1
            carried += lengths[nxt]
        start = nxt
    return spans
