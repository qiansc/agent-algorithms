import sys

sys.modules.pop("followup", None)  # 多题一起跑时，别拿到上一题的 followup 模块
from followup import dual_clip_loss


def test_extreme_negative_item_is_capped():
    assert abs(dual_clip_loss([0.1], [0.9], [-1], 0.2, 3) - 3.0) < 1e-9


def test_sample_with_extra_item():
    got = dual_clip_loss([0.5, 0.5, 0.5, 0.1], [0.8, 0.2, 0.8, 0.9], [2, -1, -1, -1], 0.2, 3)
    assert abs(got - 0.75) < 1e-9


def test_same_as_ppo_when_ratio_moderate():
    assert abs(dual_clip_loss([0.5, 0.5, 0.5], [0.8, 0.2, 0.8], [2, -1, -1], 0.2, 3)) < 1e-9
    assert abs(dual_clip_loss([0.5, 0.5], [0.55, 0.3], [1, -2], 0.2, 3) - 0.25) < 1e-9


def test_positive_advantage_not_affected():
    assert abs(dual_clip_loss([0.2], [1], [3], 0.1, 3) - (-3.3)) < 1e-9


def test_c_must_exceed_one():
    try:
        dual_clip_loss([0.5], [0.5], [1], 0.2, 1)
    except ValueError:
        return
    raise AssertionError("expected ValueError")
