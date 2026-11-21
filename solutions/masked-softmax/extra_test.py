import math

from followup import action_log_probs
from solution import action_probs


def test_naive_versions_fail():
    # 减全局最大值 2000：两个合法权重都下溢成 0，0 / 0
    weights = [math.exp(x - 2000) if ok else 0.0
               for x, ok in zip([1000, 2000, 1000], [True, False, True])]
    assert weights == [0.0, 0.0, 0.0]
    # 不减最大值：exp(1000) 在 Python 里直接抛 OverflowError
    try:
        math.exp(1000)
    except OverflowError:
        pass
    else:
        raise AssertionError("exp(1000) 应当溢出")


def test_followup_log_probs():
    got = action_log_probs([0, -800], [True, True], 1)
    assert got == [0.0, -800.0]
    # 先算概率再取 log 会得到 log(0)
    assert action_probs([0, -800], [True, True], 1)[1] == 0.0
    got = action_log_probs([2.0, 1.0, 0.1, 3.0], [True, True, True, False], 1)
    assert got[3] == -math.inf
    probs = action_probs([2.0, 1.0, 0.1, 3.0], [True, True, True, False], 1)
    for lp, p in zip(got[:3], probs[:3]):
        assert abs(math.exp(lp) - p) < 1e-12
    assert abs(got[0] - (-0.41703001627783354)) < 1e-12


def test_followup_rejects_bad_input():
    for args in (([1], [False], 1), ([1], [True], 0), ([1, 2], [True], 1)):
        try:
            action_log_probs(*args)
        except ValueError:
            continue
        raise AssertionError(f"应当拒绝 {args!r}")
