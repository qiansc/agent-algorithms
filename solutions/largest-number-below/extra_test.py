import random
import sys

# 测试脚本一次跑多道题时，各题的 followup 同名；导入前后都清掉缓存，避免拿错或留给下一题
sys.modules.pop("followup", None)
from followup import largest_at_most
sys.modules.pop("followup", None)
from solution import largest_below


def brute_below(n: int, digits: list[int]) -> int:
    """从 n - 1 往下逐个检查，第一个只由可用数字组成的数就是答案。"""
    allowed = {str(d) for d in digits}
    for x in range(n - 1, 0, -1):
        if set(str(x)) <= allowed:
            return x
    return -1


def test_random_against_brute_force():
    rng = random.Random(56)
    for _ in range(2000):
        n = rng.randint(1, 5000)
        digits = rng.sample(range(1, 10), rng.randint(1, 4))
        assert largest_below(n, digits) == brute_below(n, digits), (n, digits)
        assert largest_at_most(n, digits) == brute_below(n + 1, digits), (n, digits)


def test_followup_at_most():
    assert largest_at_most(2111, [1, 2]) == 2111
    assert largest_at_most(2533, [1, 2, 5, 9]) == 2529
    assert largest_at_most(1, [1]) == 1
    assert largest_at_most(1000, [2, 3]) == 333
