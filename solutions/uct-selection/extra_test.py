import math

from followup import uct_rounds
from solution import uct_pick

SAMPLE = [[3, 2.0], [1, 0.9], [6, 4.2]]


def test_followup_two_zero_rewards():
    # B 连续拿到 0 分：第 1、2 轮都选 B，第 3 轮换成 A
    assert uct_rounds(SAMPLE, [0, 0, 0]) == [1, 1, 0]
    assert SAMPLE == [[3, 2.0], [1, 0.9], [6, 4.2]]  # 不改调用方的列表


def test_followup_longer_run():
    assert uct_rounds(SAMPLE, [0, 0, 0, 0, 0, 0]) == [1, 1, 0, 0, 2, 1]
    assert uct_rounds([[0, 0.0], [0, 0.0], [0, 0.0]], [1, 0, 0]) == [0, 1, 2]
    assert uct_rounds(SAMPLE, []) == []


def test_score_breakdown_numbers():
    # 正文里的拆解：N = 10，ln N ≈ 2.3026
    parent = 10
    assert abs(math.log(parent) - 2.302585) < 1e-6
    means = [2.0 / 3, 0.9, 0.7]
    bonus = [math.sqrt(2) * math.sqrt(math.log(parent) / n) for n in (3, 1, 6)]
    assert [round(b, 3) for b in bonus] == [1.239, 2.146, 0.876]
    assert [round(m + b, 3) for m, b in zip(means, bonus)] == [1.906, 3.046, 1.576]


def test_default_c_matches_sqrt2():
    assert uct_pick(SAMPLE) == uct_pick(SAMPLE, math.sqrt(2))
