import random

from followup import order_kind
from solution import tool_order


def test_order_kind():
    assert order_kind(5, [(0, 3), (1, 2), (2, 3)]) == "many"
    assert order_kind(4, [(0, 1), (1, 2), (2, 3)]) == "unique"
    assert order_kind(3, [(0, 1), (1, 2), (0, 2)]) == "unique"
    assert order_kind(2, [(0, 1), (1, 0)]) == "cycle"
    assert order_kind(1, []) == "unique"
    assert order_kind(0, []) == "unique"


def test_unique_iff_largest_order_equals_smallest():
    # 合法顺序唯一，当且仅当“字典序最小”和“字典序最大”的顺序相同
    rng = random.Random(9)
    for _ in range(500):
        n = rng.randint(1, 7)
        pairs = [(a, b) for a in range(n) for b in range(n) if a < b]
        perm = list(range(n))
        rng.shuffle(perm)
        edges = [(perm[a], perm[b]) for a, b in rng.sample(pairs, rng.randint(0, len(pairs)))]
        smallest = tool_order(n, edges)
        flipped = [(n - 1 - a, n - 1 - b) for a, b in edges]
        largest = [n - 1 - v for v in tool_order(n, flipped)]
        want = "unique" if smallest == largest else "many"
        assert order_kind(n, edges) == want


