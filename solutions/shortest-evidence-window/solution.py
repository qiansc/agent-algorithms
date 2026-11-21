from collections import Counter


def shortest_evidence(
    tokens: list[str], wanted: list[str]
) -> tuple[int, int] | None:
    if not wanted:
        return (0, 0)
    need = Counter(wanted)  # 词 -> 还欠几份；负数表示窗口里多出几份
    remaining = len(wanted)  # 总共还欠几份，等于 0 时窗口合法
    left = 0
    best: tuple[int, int] | None = None
    for right, word in enumerate(tokens, start=1):  # 窗口是 [left, right)
        if word in need:
            if need[word] > 0:  # 这一份是真正欠着的
                remaining -= 1
            need[word] -= 1
        while remaining == 0:  # 合法就尽量把左端往右收
            if best is None or right - left < best[1] - best[0]:
                best = (left, right)  # 严格更短才更新，并列保留靠左的
            old = tokens[left]
            left += 1
            if old in need:
                need[old] += 1
                if need[old] > 0:  # 移出的是必需的一份，又欠上了
                    remaining += 1
    return best
