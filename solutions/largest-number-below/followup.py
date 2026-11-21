from solution import largest_below


def largest_at_most(n: int, digits: list[int]) -> int:
    below = largest_below(n, digits)  # 顺便完成参数检查
    if all(int(c) in digits for c in str(n)):
        return n  # n 的每一位都可用，n 本身就是答案
    return below
