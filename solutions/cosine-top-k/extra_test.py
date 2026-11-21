import random

from followup import CosineIndex
from solution import cosine_top_k


def test_followup_sample():
    index = CosineIndex([[1, 1], [5, 0], [0, 0], [-1, 0]])
    assert index.query([1, 0], 3) == [1, 0, 3]
    assert index.query([0, 2], 2) == [0, 1]
    assert index.query([1, 0], 0) == []


def test_followup_rejects_zero_query():
    index = CosineIndex([[1, 1]])
    try:
        index.query([0, 0], 1)
    except ValueError:
        return
    raise AssertionError("expected ValueError")


def test_followup_matches_exact_and_distance():
    rng = random.Random(11)
    docs = [[rng.randint(-50, 50) for _ in range(5)] for _ in range(60)]
    index = CosineIndex(docs)
    for _ in range(30):
        q = [rng.randint(-50, 50) for _ in range(5)]
        if not any(q):
            continue
        got = index.query(q, 8)
        assert got == cosine_top_k(q, docs, 8)
        # 单位向量之间：距离平方 = 2 - 2 × 点积，按距离从小到大排出同样的次序
        norm = sum(x * x for x in q) ** 0.5
        qu = [x / norm for x in q]
        dist = []
        for idx, u in index.units:
            dist.append((sum((a - b) ** 2 for a, b in zip(qu, u)), idx))
        assert [idx for _, idx in sorted(dist)[:8]] == got


def test_followup_float_tie_breaks_differently():
    # 归一化后 [1,1] 与 [3,3] 的单位向量差在最后一位，浮点点积把 3,3 排在前面
    index = CosineIndex([[1, 1], [3, 3]])
    assert index.query([1, 0], 2) == [1, 0]
    assert cosine_top_k([1, 0], [[1, 1], [3, 3]], 2) == [0, 1]
