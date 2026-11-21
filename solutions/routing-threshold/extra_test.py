import math
import random

from solution import best_threshold


def brute(samples, fp, fn):
    best = None
    for t in sorted({s for s, _ in samples} | {math.inf}, reverse=True):
        loss = sum(fp for s, y in samples if s >= t and y == 0) + sum(fn for s, y in samples if s < t and y == 1)
        if best is None or loss < best[1]:
            best = (t, loss)
    return best


def test_against_brute_force():
    rng = random.Random(49)
    for _ in range(2000):
        samples = [(rng.choice([0.1, 0.2, 0.3, 0.5, 0.7, 0.9]), rng.randint(0, 1)) for _ in range(rng.randint(0, 10))]
        fp, fn = rng.randint(0, 5), rng.randint(0, 5)
        assert best_threshold(samples, fp, fn) == brute(samples, fp, fn)


def test_input_order_does_not_matter():
    a = [(0.9, 1), (0.8, 1), (0.8, 0), (0.2, 1)]
    b = [(0.2, 1), (0.8, 0), (0.9, 1), (0.8, 1)]
    assert best_threshold(a, 4, 2) == best_threshold(b, 4, 2) == (0.9, 4)
