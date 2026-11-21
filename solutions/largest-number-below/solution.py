def largest_below(n: int, digits: list[int]) -> int:
    if n < 1:
        raise ValueError("n must be a positive integer")
    ds = sorted(set(digits))
    if not ds or any(d not in range(1, 10) for d in ds):
        raise ValueError("digits must be integers from 1 to 9")
    s = str(n)
    length = len(s)
    biggest = str(ds[-1])
    same = 0  # n 的前 same 位都能用可用数字原样照抄
    while same < length and int(s[same]) in ds:
        same += 1
    # i 是答案第一次比 n 小的位置：前 i 位照抄，第 i 位放更小的数字，
    # 后面全放最大数字。i 越靠右答案越大，所以从右往左试。
    # 全部照抄就等于 n，所以 i 最多到 length - 1
    for i in range(min(same, length - 1), -1, -1):
        smaller = [d for d in ds if d < int(s[i])]
        if smaller:
            head = s[:i] + str(smaller[-1])
            return int(head + biggest * (length - i - 1))
    # 同样位数拼不出来，就少一位，每一位都放最大数字
    return int(biggest * (length - 1)) if length > 1 else -1
