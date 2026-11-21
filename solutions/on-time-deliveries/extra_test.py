import itertools
import random

from followup import max_on_time_value
from solution import max_on_time


def _brute_value(orders):
    best = 0
    for m in range(len(orders) + 1):
        for subset in itertools.combinations(orders, m):
            t, ok = 0, True
            for d, deadline, _ in sorted(subset, key=lambda o: o[1]):
                t += d
                ok = ok and t <= deadline
            if ok:
                best = max(best, sum(o[2] for o in subset))
    return best


def test_followup_counterexamples():
    # 按单数贪心会选 B、C（价值 4），只送 A 能拿 10
    assert max_on_time([[3, 3], [1, 2], [1, 3]]) == 2
    assert max_on_time_value([[3, 3, 10], [1, 2, 2], [1, 3, 2]]) == 10
    # 超时就去掉价值最低的一单，会得到 10；P、Q 一起送是 11
    assert max_on_time_value([[1, 2, 6], [1, 2, 5], [2, 2, 10]]) == 11


def test_followup_edges():
    assert max_on_time_value([]) == 0
    assert max_on_time_value([[3, 2, 9]]) == 0
    assert max_on_time_value([[5, 5, 7]]) == 7
    for bad in ([[0, 5, 1]], [[1, 5]], [[1, 5, -1]]):
        try:
            max_on_time_value(bad)
        except ValueError:
            continue
        raise AssertionError(f"应当拒绝 {bad}")


def test_followup_matches_brute_force():
    rng = random.Random(230)
    for _ in range(300):
        orders = [[rng.randint(1, 5), rng.randint(0, 12), rng.randint(0, 9)] for _ in range(rng.randint(0, 7))]
        assert max_on_time_value(orders) == _brute_value(orders), orders


def test_value_one_equals_count():
    rng = random.Random(231)
    for _ in range(300):
        orders = [[rng.randint(1, 5), rng.randint(0, 12)] for _ in range(rng.randint(0, 8))]
        assert max_on_time_value([o + [1] for o in orders]) == max_on_time(orders)
