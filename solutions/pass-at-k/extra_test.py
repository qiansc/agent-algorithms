import math
import random
from fractions import Fraction

from followup import mean_pass_at_k
from solution import pass_at_k


def exact(n: int, c: int, k: int) -> float:
    return float(1 - Fraction(math.comb(n - c, k), math.comb(n, k)))


def test_against_combinations():
    rng = random.Random(24)
    for _ in range(300):
        n = rng.randint(1, 60)
        c = rng.randint(0, n)
        k = rng.randint(1, n)
        assert abs(pass_at_k(n, c, k) - exact(n, c, k)) <= 1e-12


def test_followup_average_per_task():
    # 一道题两次全对，一道题两次全错：平均 0.5；混在一起会得到 5/6
    assert mean_pass_at_k([(2, 2), (2, 0)], 2) == 0.5
    assert math.isclose(pass_at_k(4, 2, 2), 5 / 6)
    assert math.isclose(mean_pass_at_k([(5, 2), (10, 3), (3, 0)], 2), (0.7 + 8 / 15 + 0) / 3)
    try:
        mean_pass_at_k([], 1)
    except ValueError:
        pass
    else:
        raise AssertionError("空列表应当报错")
