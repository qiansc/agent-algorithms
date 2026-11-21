from collections.abc import Iterable


def streaming_mean_var(stream: Iterable[float]) -> tuple[float, float]:
    """一遍扫描求均值和总体方差（Welford 递推）。"""
    n = 0
    mean = 0.0
    m2 = 0.0  # 到目前为止 (x - mean)^2 的累加和
    for t in stream:
        n += 1
        delta = t - mean          # 用更新前的均值
        mean += delta / n
        m2 += delta * (t - mean)  # 用更新后的均值
    if n == 0:
        raise ValueError("empty stream")
    return mean, m2 / n
