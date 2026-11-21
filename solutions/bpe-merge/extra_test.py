import sys

# 测试脚本会依次加载多道题，先清掉别的题缓存的 followup 模块，用完也清掉
sys.modules.pop("followup", None)
from followup import encode  # noqa: E402

sys.modules.pop("followup", None)
from solution import merge_once  # noqa: E402

# 样例 1 的语料连续训练三轮学到的合并表
MERGES = [(1, 1, 9), (1, 2, 10), (9, 1, 11)]


def test_three_rounds_learn_merges():
    rows = [([1, 1, 1], 2), ([1, 2], 3)]
    learned = []
    for new_id in (9, 10, 11):
        pair, rows = merge_once(rows, new_id)
        learned.append((*pair, new_id))
    assert learned == MERGES
    assert rows == [([11], 2), ([10], 3)]


def test_followup_encode_by_rank():
    assert encode([1, 2, 1, 1, 2], MERGES) == [10, 9, 2]
    assert encode([1, 1, 1, 2], MERGES) == [9, 10]
    assert encode([1, 1, 1], MERGES) == [11]
    assert encode([1, 1, 1, 1, 1], MERGES) == [9, 11]
    assert encode([], MERGES) == []
    assert encode([3, 4], MERGES) == [3, 4]
    # 对新文本重新计票会先合并 (1, 2)，得到另一种切分
    _, rows = merge_once([([1, 2, 1, 1, 2], 1)], 10)
    assert rows == [([10, 1, 10], 1)]
