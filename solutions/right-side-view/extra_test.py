import random

from followup import right_view_dfs
from solution import right_view


def random_tree(rng, n):
    if n == 0:
        return None
    k = rng.randint(0, n - 1)
    return (rng.randint(-50, 50), random_tree(rng, k), random_tree(rng, n - 1 - k))


def test_followup_samples():
    sample = ("A", ("B", ("D", None, None), None), ("C", None, None))
    assert right_view_dfs(sample) == ["A", "C", "D"]
    assert right_view_dfs(None) == []


def test_followup_random_against_bfs():
    rng = random.Random(52)
    for _ in range(500):
        tree = random_tree(rng, rng.randint(0, 40))
        assert right_view_dfs(tree) == right_view(tree)


def test_followup_deep_chain_without_recursion():
    tree = None
    for value in range(100_000, 0, -1):  # 10 万层、只往左长的链
        tree = (value, tree, None)
    assert right_view_dfs(tree) == list(range(1, 100_001))
