import random

from followup import shortest_ordered

TOKENS = ["A", "X", "B", "A", "C", "A", "B"]


def brute_ordered(tokens, wanted):
    if not wanted:
        return (0, 0)
    for length in range(1, len(tokens) + 1):
        for left in range(len(tokens) - length + 1):
            it = iter(tokens[left:left + length])
            if all(w in it for w in wanted):
                return (left, left + length)
    return None


def test_followup_sample():
    assert shortest_ordered(TOKENS, ["A", "A", "B"]) == (3, 7)
    assert shortest_ordered(TOKENS, ["B", "A"]) == (2, 4)
    assert shortest_ordered(TOKENS, []) == (0, 0)
    assert shortest_ordered(TOKENS, ["B", "B", "B"]) is None


def test_followup_matches_brute_force():
    rng = random.Random(4)
    for _ in range(500):
        tokens = [rng.choice("ABCX") for _ in range(rng.randint(0, 10))]
        wanted = [rng.choice("ABC") for _ in range(rng.randint(0, 4))]
        assert shortest_ordered(tokens, wanted) == brute_ordered(tokens, wanted)
