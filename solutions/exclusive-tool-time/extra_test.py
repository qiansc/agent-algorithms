from followup import exclusive_time_units


def test_followup_inclusive_end():
    # end 4 表示第 4 格也跑完了：B 占 2、3、4 三格，A 占 0、1、5 三格
    got = exclusive_time_units([(0, "A", "start"), (2, "B", "start"), (4, "B", "end"), (5, "A", "end")])
    assert got == {"A": 3, "B": 3}
    # 力扣 636 的样例 1
    got = exclusive_time_units([(0, "0", "start"), (2, "1", "start"), (5, "1", "end"), (6, "0", "end")])
    assert got == {"0": 3, "1": 4}
    # 开始和结束在同一格，占 1 格
    assert exclusive_time_units([(3, "A", "start"), (3, "A", "end")]) == {"A": 1}
    # 递归
    got = exclusive_time_units([(0, "A", "start"), (2, "A", "start"), (5, "A", "end"), (7, "A", "end")])
    assert got == {"A": 8}
    assert exclusive_time_units([]) == {}


def test_followup_rejects_mismatch():
    try:
        exclusive_time_units([(0, "A", "start"), (1, "B", "end")])
    except ValueError:
        return
    raise AssertionError("应当抛出 ValueError")
