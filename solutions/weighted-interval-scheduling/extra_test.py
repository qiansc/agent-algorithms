import sys

sys.modules.pop("followup", None)  # 多道题在同一进程里测试时，别拿到上一题的 followup
import itertools
import random

from followup import best_window_value_k

SAMPLE = [(0, 3, 8), (1, 2, 3), (2, 5, 6), (3, 5, 7), (5, 6, 2)]


def brute(jobs, k):
    best = 0
    for r in range(min(k, len(jobs)) + 1):
        for pick in itertools.combinations(sorted(jobs), r):
            if all(a[1] <= b[0] for a, b in zip(pick, pick[1:])):
                best = max(best, sum(v for _, _, v in pick))
    return best


def test_followup_at_most_k_jobs():
    assert [best_window_value_k(SAMPLE, k) for k in range(5)] == [0, 8, 15, 17, 17]
    assert best_window_value_k([], 3) == 0


def test_followup_matches_brute_force():
    rng = random.Random(20)
    for _ in range(150):
        jobs = []
        for _ in range(rng.randint(0, 8)):
            a = rng.randint(0, 10)
            jobs.append((a, a + rng.randint(1, 5), rng.randint(1, 9)))
        k = rng.randint(0, 4)
        assert best_window_value_k(jobs, k) == brute(jobs, k)
