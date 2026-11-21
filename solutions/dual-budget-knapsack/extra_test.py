import sys

sys.modules.pop("followup", None)  # 多道题在同一进程里测试时，别拿到上一题的 followup
from followup import best_branches_exact
from solution import best_branches

SAMPLE = [(2, 4, 9), (1, 3, 6), (1, 2, 5)]


def test_followup_budgets_used_exactly():
    assert best_branches_exact(SAMPLE, 2, 5) == 11
    assert best_branches_exact(SAMPLE, 2, 4) == 9
    assert best_branches_exact(SAMPLE, 0, 0) == 0
    # 恰好 1 次调用、4 单位 token 凑不出来；“最多”版本会给 6
    assert best_branches_exact(SAMPLE, 1, 4) == -1
    assert best_branches(SAMPLE, 1, 4) == 6
