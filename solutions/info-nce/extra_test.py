import math

import sys

sys.modules.pop("followup", None)  # 多题一起跑时，别拿到上一题的 followup 模块
from followup import info_nce_with_ids

Q = [[1, 0], [1, 0], [0, 1]]
D = [[1, 0], [1, 0], [0, 1]]


def test_duplicate_docs_are_not_negatives():
    got = info_nce_with_ids(Q, D, [7, 7, 9], 1)
    assert abs(got - 0.3926560297) < 1e-9


def test_distinct_ids_match_plain_info_nce():
    got = info_nce_with_ids(Q, D, [1, 2, 3], 1)
    assert abs(got - 0.7584781073) < 1e-9


def test_sample_unchanged_when_ids_distinct():
    got = info_nce_with_ids([[3, 0], [0, 1]], [[1, 0], [0, 2]], [0, 1], 1)
    assert abs(got - math.log(1 + math.exp(-1))) < 1e-12


def test_bad_lengths_raise():
    try:
        info_nce_with_ids(Q, D, [1, 2], 1)
    except ValueError:
        return
    raise AssertionError("expected ValueError")
