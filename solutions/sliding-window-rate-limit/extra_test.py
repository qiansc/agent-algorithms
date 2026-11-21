import random

from followup import token_bucket
from solution import allow_requests


def _brute(times, w, limit):
    accepted, result = [], []
    for t in times:
        ok = sum(1 for a in accepted if t - w < a <= t) < limit
        result.append(ok)
        if ok:
            accepted.append(t)
    return result


def test_matches_brute_force():
    rng = random.Random(26)
    for _ in range(500):
        times = sorted(rng.randint(0, 30) for _ in range(rng.randint(0, 12)))
        w, limit = rng.randint(1, 10), rng.randint(0, 4)
        assert allow_requests(times, w, limit) == _brute(times, w, limit)


def test_token_bucket_sample():
    # 与滑动窗口只差第 4 个请求：第 59 秒桶已补满，可以再放一次
    assert token_bucket([0, 0, 59, 59, 60, 60, 60], 60, 3) == [True, True, True, True, True, False, False]


def test_token_bucket_edges():
    assert token_bucket([], 60, 3) == []
    assert token_bucket([1, 2], 5, 0) == [False, False]
    # 容量 2、每 10 秒补 2 个，即每 5 秒 1 个
    assert token_bucket([0, 0, 0, 4, 5, 10, 10], 10, 2) == [True, True, False, False, True, True, False]
    for args in (([1], 0, 3), ([1], 60, -1), ([5, 3], 60, 3)):
        try:
            token_bucket(*args)
        except ValueError:
            continue
        raise AssertionError(f"应当拒绝 {args}")


def test_token_bucket_long_run_rate():
    # 长时间每秒都来请求，平均每 w 秒放行约 limit 个，再加上开头满桶的 limit 个
    times = list(range(600))
    assert sum(token_bucket(times, 60, 3)) == 3 + 600 * 3 // 60 - 1
    assert sum(allow_requests(times, 60, 3)) == 30
