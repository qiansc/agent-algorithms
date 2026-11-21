def longest_unique(s: str) -> int:
    last = {}            # 字符 -> 它最近一次出现的下标
    left = best = 0      # 窗口是 s[left : right + 1]
    for right, ch in enumerate(s):
        # 上一个 ch 若还在窗口里，左边界跳到它后面一格；已经在窗口外就不动
        left = max(left, last.get(ch, -1) + 1)
        best = max(best, right - left + 1)
        last[ch] = right
    return best
