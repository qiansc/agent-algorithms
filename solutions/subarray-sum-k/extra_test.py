import random

from followup import longest_reward_span


def brute_longest(rewards, k):
    n = len(rewards)
    lengths = [j - i + 1 for i in range(n) for j in range(i, n) if sum(rewards[i:j + 1]) == k]
    return max(lengths, default=0)


def test_followup_samples():
    assert longest_reward_span([1, -1, 1, 0], 1) == 4
    assert longest_reward_span([0, 0], 0) == 2
    assert longest_reward_span([4, -1], 3) == 2
    assert longest_reward_span([1, 2, 3], 7) == 0
    assert longest_reward_span([], 0) == 0


def test_followup_random_against_brute():
    rng = random.Random(53)
    for _ in range(1000):
        rewards = [rng.randint(-3, 3) for _ in range(rng.randint(0, 12))]
        k = rng.randint(-4, 4)
        assert longest_reward_span(rewards, k) == brute_longest(rewards, k)
