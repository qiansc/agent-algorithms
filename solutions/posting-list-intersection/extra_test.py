import random

from followup import intersect_short_long
from solution import intersect_lists


def test_followup_matches_merge():
    assert intersect_short_long([2, 8, 9], [1, 2, 8, 20]) == [2, 8]
    assert intersect_short_long([3, 500, 9999], list(range(0, 10000, 3))) == [3, 9999]
    assert intersect_short_long([], [1, 2]) == []
    assert intersect_short_long([5], []) == []
    rng = random.Random(7)
    for _ in range(200):
        a = sorted(rng.sample(range(60), rng.randint(0, 6)))
        b = sorted(rng.sample(range(60), rng.randint(0, 40)))
        assert intersect_short_long(a, b) == intersect_lists([a, b])


def test_merge_matches_set_intersection():
    rng = random.Random(5)
    for _ in range(300):
        lists = [sorted(rng.sample(range(40), rng.randint(0, 25))) for _ in range(rng.randint(1, 5))]
        want = sorted(set.intersection(*map(set, lists)))
        assert intersect_lists(lists) == want


def test_input_not_modified():
    lists = [[2, 5, 8, 13], [1, 2, 8, 20], [2, 8, 9]]
    intersect_lists(lists)
    assert lists == [[2, 5, 8, 13], [1, 2, 8, 20], [2, 8, 9]]
