import math

from followup import rope_score

Q = [1, 2, 0.5, -1]
K = [0.3, -0.7, 2, 1]


def test_score_depends_on_offset_only():
    for m, n in [(3, 5), (0, 2), (10, 12), (1, 3)]:
        assert math.isclose(rope_score(Q, K, m, n, 100), 1.1431748480875898, abs_tol=1e-12)


def test_order_matters():
    assert math.isclose(rope_score(Q, K, 5, 3, 100), -0.2276518076838766, abs_tol=1e-12)


def test_shift_all_positions():
    # 位置整体从 0 改成从 1 编号，每对分数都不变
    for m in range(4):
        for n in range(4):
            assert math.isclose(rope_score(Q, K, m, n, 100), rope_score(Q, K, m + 1, n + 1, 100), abs_tol=1e-12)


def test_same_position_is_plain_dot():
    assert math.isclose(rope_score(Q, K, 2, 2, 100), -1.1, abs_tol=1e-12)
