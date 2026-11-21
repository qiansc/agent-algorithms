from collections import Counter

Row = tuple[list[int], int]  # (token 列表, 词频)


def merge_once(
    rows: list[Row], new_id: int
) -> tuple[tuple[int, int] | None, list[Row]]:
    for _, freq in rows:
        if not isinstance(freq, int) or freq <= 0:
            raise ValueError("frequency must be a positive integer")
    # 第一遍：计票。相邻位置可以重叠，[1, 1, 1] 里有两对 (1, 1)
    counts: Counter[tuple[int, int]] = Counter()
    for tokens, freq in rows:
        for i in range(len(tokens) - 1):
            counts[tokens[i], tokens[i + 1]] += freq
    if not counts:
        return None, rows
    # 票数最高；并列时取数对字典序最小的
    pair = min(counts, key=lambda p: (-counts[p], p))
    a, b = pair
    # 第二遍：每行从左到右替换，一个 token 只能用一次
    merged: list[Row] = []
    for tokens, freq in rows:
        out: list[int] = []
        i = 0
        while i < len(tokens):
            nxt = tokens[i + 1] if i + 1 < len(tokens) else None
            if tokens[i] == a and nxt == b:
                out.append(new_id)
                i += 2
            else:
                out.append(tokens[i])
                i += 1
        merged.append((out, freq))
    return pair, merged
