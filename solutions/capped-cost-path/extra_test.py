import sys

sys.modules.pop("followup", None)  # 多道题在同一进程里测试时，别拿到上一题的 followup
import random
from followup import capped_cost_path
from solution import capped_cost

SAMPLE = [(0, 1, 1), (1, 2, 1), (0, 2, 6), (2, 3, 1)]


def test_followup_sample_paths():
    assert capped_cost_path(4, SAMPLE, 0, 3, 2) == (7, [0, 2, 3])
    assert capped_cost_path(4, SAMPLE, 0, 3, 3) == (3, [0, 1, 2, 3])
    assert capped_cost_path(4, SAMPLE, 0, 3, 1) == (-1, [])
    assert capped_cost_path(1, [], 0, 0, 0) == (0, [0])
    assert capped_cost_path(3, [(0, 1, 0), (1, 0, 0), (1, 2, 5)], 0, 2, 2) == (5, [0, 1, 2])


def test_followup_path_is_valid_on_random_graphs():
    rng = random.Random(7)
    for _ in range(200):
        n = rng.randint(1, 6)
        edges = [(rng.randrange(n), rng.randrange(n), rng.randint(0, 9)) for _ in range(rng.randint(0, 12))]
        src, dst, limit = rng.randrange(n), rng.randrange(n), rng.randint(0, 4)
        cost, path = capped_cost_path(n, edges, src, dst, limit)
        assert cost == capped_cost(n, edges, src, dst, limit)
        if cost == -1:
            assert path == []
            continue
        assert path[0] == src and path[-1] == dst and len(path) - 1 <= limit
        # 每一步都要有一条边，并且按最便宜的那条算，总价正好是 cost
        total = sum(min(c for u, v, c in edges if (u, v) == (a, b)) for a, b in zip(path, path[1:]))
        assert total == cost
