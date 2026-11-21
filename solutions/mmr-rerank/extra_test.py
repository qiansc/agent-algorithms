import random

from solution import mmr


def naive_mmr(query_sim, pair_sim, k, lam):
    """每轮和所有已选片段重新比一遍的 O(n·k²) 写法，用来对拍。"""
    n = len(query_sim)
    chosen = [max(range(n), key=lambda i: (query_sim[i], -i))]
    while len(chosen) < min(k, n):
        best, best_score = None, float("-inf")
        for i in range(n):
            if i in chosen:
                continue
            redundancy = max(pair_sim[i][j] for j in chosen)
            score = lam * query_sim[i] - (1 - lam) * redundancy
            if score > best_score:
                best, best_score = i, score
        chosen.append(best)
    return chosen


def test_incremental_matches_naive():
    rng = random.Random(21)
    for _ in range(300):
        n = rng.randint(1, 9)
        q = [rng.randint(0, 20) / 20 for _ in range(n)]
        p = [[1.0] * n for _ in range(n)]
        for i in range(n):
            for j in range(i + 1, n):
                p[i][j] = p[j][i] = rng.randint(0, 20) / 20
        k = rng.randint(1, n + 1)
        lam = rng.choice([0, 0.25, 0.5, 0.75, 1])
        assert mmr(q, p, k, lam) == naive_mmr(q, p, k, lam)
