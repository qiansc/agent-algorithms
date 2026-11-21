import random
import sys

# 测试脚本一次跑多道题时，各题的 followup 同名；导入前后都清掉缓存，避免拿错或留给下一题
sys.modules.pop("followup", None)
from followup import lis_sequence
sys.modules.pop("followup", None)
from solution import lis_length


def quadratic_lis(nums: list[int]) -> int:
    best = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                best[i] = max(best[i], best[j] + 1)
    return max(best, default=0)


def is_valid(seq: list[int], nums: list[int]) -> bool:
    it = iter(nums)
    in_order = all(any(v == x for x in it) for v in seq)  # 按顺序是 nums 的子序列
    increasing = all(a < b for a, b in zip(seq, seq[1:]))
    return in_order and increasing


def test_followup_examples():
    assert lis_sequence([10, 9, 2, 5, 3, 7, 101, 18]) == [2, 3, 7, 18]
    assert lis_sequence([3, 4, 1]) == [3, 4]
    assert lis_sequence([2, 2, 2]) == [2]
    assert lis_sequence([]) == []
    assert lis_sequence([0, 1, 0, 3, 2, 3]) == [0, 1, 2, 3]


def test_random_against_quadratic():
    rng = random.Random(54)
    for _ in range(500):
        nums = [rng.randint(-20, 20) for _ in range(rng.randint(0, 30))]
        want = quadratic_lis(nums)
        assert lis_length(nums) == want, nums
        seq = lis_sequence(nums)
        assert len(seq) == want and is_valid(seq, nums), (nums, seq)
