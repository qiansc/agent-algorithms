from followup import additive_penalties


def test_additive_sample():
    got = additive_penalties([2.0, -1.0, 0.5, 1.0, 1.0], [0, 1, 1], 0.5, 0.5)
    assert got == [1.0, -2.5, 0.5, 1.0, 1.0]


def test_additive_no_history():
    assert additive_penalties([0.3, -0.2], [], 1.0, 1.0) == [0.3, -0.2]


def test_additive_frequency_grows():
    # 出现 3 次：3 × 0.4 + 0.1 = 1.3
    got = additive_penalties([2.0, 0.0], [0, 0, 0], 0.4, 0.1)
    assert abs(got[0] - 0.7) < 1e-12 and got[1] == 0.0
