import math
import random

from followup import grouped_query_causal
from solution import multi_head_causal


def eye(n):
    return [[1.0 if i == j else 0.0 for j in range(n)] for i in range(n)]


def close(a, b):
    return all(math.isclose(p, q, abs_tol=1e-12) for ra, rb in zip(a, b) for p, q in zip(ra, rb))


X = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]]


def test_gqa_with_groups_equal_heads_is_mha():
    assert close(grouped_query_causal(X, eye(4), eye(4), eye(4), eye(4), 2, 2),
                 multi_head_causal(X, eye(4), eye(4), eye(4), eye(4), 2))


def test_mqa_sample():
    wk = [[1, 0], [0, 1], [0, 0], [0, 0]]  # K 取 x 的前两列
    wv = [[0, 0], [0, 0], [1, 0], [0, 1]]  # V 取 x 的后两列
    got = grouped_query_causal(X, eye(4), wk, wv, eye(4), 2, 1)
    e = math.exp(1 / math.sqrt(2))
    want = [
        [1.0, 0.0, 1.0, 0.0],
        [1 / (1 + e), e / (1 + e), 1 / (1 + e), e / (1 + e)],
        [1 / (2 + e), 1 / (2 + e), 1 / 3, 1 / 3],
    ]
    assert close(got, want)


def test_gqa_equals_mha_with_repeated_kv():
    rng = random.Random(5)
    rand = lambda r, c: [[rng.uniform(-1, 1) for _ in range(c)] for _ in range(r)]
    x, wq, wk, wv, wo = rand(3, 8), rand(8, 8), rand(8, 4), rand(8, 4), rand(8, 8)
    # 4 个头、2 组、dh = 2：把每组的两列复制给它的两个查询头
    expand = lambda w: [[row[(h // 2) * 2 + c] for h in range(4) for c in range(2)] for row in w]
    assert close(grouped_query_causal(x, wq, wk, wv, wo, 4, 2),
                 multi_head_causal(x, wq, expand(wk), expand(wv), wo, 4))


def test_gqa_rejects_bad_groups():
    try:
        grouped_query_causal(X, eye(4), eye(4), eye(4), eye(4), 2, 3)
    except ValueError:
        return
    raise AssertionError("expected ValueError")
