import math


def rope(
    vec: list[float], pos: float, base: float = 10000.0
) -> list[float]:
    d = len(vec)
    if d % 2:
        raise ValueError("dimension must be even")
    out = list(vec)
    for j in range(d // 2):  # 第 j 对是 (vec[2j], vec[2j+1])
        theta = pos * base ** (-2 * j / d)
        c, s = math.cos(theta), math.sin(theta)
        x, y = vec[2 * j], vec[2 * j + 1]
        # 两个新值都用旧的 x、y 算
        out[2 * j], out[2 * j + 1] = x * c - y * s, x * s + y * c
    return out
