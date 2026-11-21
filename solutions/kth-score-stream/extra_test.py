import random

from followup import kth_across_shards
from solution import KthScore


def test_followup_shards():
    assert kth_across_shards([[10, 9, 8, 1], [7, 2]], 3) == 8
    # 每台只留 2 个时会错：候选只剩 10、9、7、2，第 3 大变成 7
    assert sorted([10, 9, 7, 2], reverse=True)[2] == 7
    assert kth_across_shards([[1], [2]], 3) is None
    rng = random.Random(3)
    for _ in range(200):
        shards = [[rng.randint(0, 9) for _ in range(rng.randint(0, 6))] for _ in range(rng.randint(1, 4))]
        k = rng.randint(1, 5)
        flat = sorted((x for s in shards for x in s), reverse=True)
        assert kth_across_shards(shards, k) == (flat[k - 1] if len(flat) >= k else None)


def test_matches_sorting():
    rng = random.Random(11)
    for _ in range(200):
        k = rng.randint(1, 6)
        ks = KthScore(k)
        seen: list[int] = []
        for _ in range(rng.randint(0, 30)):
            x = rng.randint(-5, 5)
            seen.append(x)
            want = sorted(seen, reverse=True)[k - 1] if len(seen) >= k else None
            assert ks.add(x) == want


def test_rejects_bad_k():
    for k in (0, -1):
        try:
            KthScore(k)
        except ValueError:
            continue
        raise AssertionError("expected ValueError")
