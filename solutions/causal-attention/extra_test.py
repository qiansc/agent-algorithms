import math

from followup import KVCache
from solution import causal_attention

Q = [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0]]
K = [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0]]
V = [[3], [6], [9]]


def test_cache_matches_full_matrix():
    cache = KVCache()
    full = causal_attention(Q, K, V)
    for i in range(3):
        row = cache.step(Q[i], K[i], V[i])
        assert all(math.isclose(a, b, abs_tol=1e-12) for a, b in zip(row, full[i]))
    assert len(cache.keys) == 3


def test_cache_sample_one():
    cache = KVCache()
    assert cache.step([0], [0], [2]) == [2.0]
    assert math.isclose(cache.step([1], [math.log(3)], [10])[0], 8.0)
