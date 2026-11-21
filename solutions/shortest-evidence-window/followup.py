def shortest_ordered(
    tokens: list[str], wanted: list[str]
) -> tuple[int, int] | None:
    """wanted 必须按给定顺序出现（中间可以夹别的词）的最短窗口。"""
    m = len(wanted)
    if m == 0:
        return (0, 0)
    # start[j]：在已读的 tokens 里，按顺序匹配完 wanted[0..j] 时，
    # 第一个词最晚能从哪个下标开始；-1 表示还匹配不上
    start = [-1] * m
    best: tuple[int, int] | None = None
    for r, word in enumerate(tokens):
        # j 从大到小更新，保证同一个词不会在这一步被用两次
        for j in range(m - 1, -1, -1):
            if word != wanted[j]:
                continue
            if j == 0:
                start[0] = r
            elif start[j - 1] != -1:
                start[j] = start[j - 1]
        if word == wanted[-1] and start[m - 1] != -1:
            left, right = start[m - 1], r + 1
            if best is None or right - left < best[1] - best[0]:
                best = (left, right)
    return best
