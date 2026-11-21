import math


def _check(x: list[float], eps: float, *params: list[float]) -> None:
    if not x:
        raise ValueError("x must not be empty")
    if any(len(p) != len(x) for p in params):
        raise ValueError("gamma / beta must match the length of x")
    if eps < 0:
        raise ValueError("eps must be non-negative")


def layer_norm(
    x: list[float],
    gamma: list[float],
    beta: list[float],
    eps: float = 1e-5,
) -> list[float]:
    _check(x, eps, gamma, beta)
    d = len(x)
    mean = sum(x) / d
    var = sum((t - mean) ** 2 for t in x) / d  # 总体方差：除以 d
    std = math.sqrt(var + eps)                 # eps 加在根号里面
    if std == 0:
        raise ValueError("zero variance with eps = 0")
    return [g * (t - mean) / std + b for t, g, b in zip(x, gamma, beta)]


def rms_norm(
    x: list[float],
    gamma: list[float],
    eps: float = 1e-6,
) -> list[float]:
    _check(x, eps, gamma)
    # 不减均值，直接求平方的平均
    rms = math.sqrt(sum(t * t for t in x) / len(x) + eps)
    if rms == 0:
        raise ValueError("all-zero input with eps = 0")
    return [g * t / rms for t, g in zip(x, gamma)]
