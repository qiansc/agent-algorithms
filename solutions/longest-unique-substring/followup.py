def longest_unique_text(s: str) -> str:
    last = {}
    left = best = start = 0
    for right, ch in enumerate(s):
        left = max(left, last.get(ch, -1) + 1)
        if right - left + 1 > best:  # 严格变长才更新，并列时保留靠左的一段
            best, start = right - left + 1, left
        last[ch] = right
    return s[start:start + best]
