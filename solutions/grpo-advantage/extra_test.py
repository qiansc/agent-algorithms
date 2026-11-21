import sys

sys.modules.pop("followup", None)  # 多题一起跑时，别拿到上一题的 followup 模块
from followup import group_advantages_eps


def close(got: list[list[float]], want: list[list[float]]) -> None:
    assert len(got) == len(want)
    for g, w in zip(got, want):
        assert len(g) == len(w)
        assert all(abs(a - b) < 1e-9 for a, b in zip(g, w))


def test_eps_barely_changes_large_spread():
    k = 2 / 2.01
    close(group_advantages_eps([[10, 10, 14, 14]], 0.01), [[-k, -k, k, k]])


def test_eps_halves_tiny_spread():
    close(group_advantages_eps([[0, 0, 0.02, 0.02]], 0.01), [[-0.5, -0.5, 0.5, 0.5]])


def test_equal_group_and_empty_group():
    close(group_advantages_eps([[5, 5], [], [1]], 0.01), [[0, 0], [], [0]])


def test_eps_must_be_positive():
    try:
        group_advantages_eps([[1, 2]], 0)
    except ValueError:
        return
    raise AssertionError("expected ValueError")
