import math
import random
import sys
from itertools import combinations

# 测试脚本一次跑多道题时，各题的 followup 同名；导入前后都清掉缓存，避免拿错或留给下一题
sys.modules.pop("followup", None)
from followup import lcs_length, rouge_l
sys.modules.pop("followup", None)
from solution import lcs


def is_subsequence(seq: list, whole) -> bool:
    it = iter(whole)
    return all(any(v == x for x in it) for v in seq)  # 迭代器只往前走，保证顺序


def brute_lcs_length(a: str, b: str) -> int:
    # 从长到短枚举 a 的所有子序列，第一个同时是 b 的子序列的就是答案
    for k in range(len(a), 0, -1):
        for idx in combinations(range(len(a)), k):
            if is_subsequence([a[i] for i in idx], b):
                return k
    return 0


def test_random_against_brute_force():
    rng = random.Random(55)
    for _ in range(300):
        a = "".join(rng.choice("ABC") for _ in range(rng.randint(0, 8)))
        b = "".join(rng.choice("ABC") for _ in range(rng.randint(0, 8)))
        length, seq = lcs(a, b)
        assert length == brute_lcs_length(a, b), (a, b)
        assert len(seq) == length and is_subsequence(seq, a) and is_subsequence(seq, b), (a, b, seq)
        assert lcs_length(list(a), list(b)) == length


def test_rouge_l_example():
    p, r, f = rouge_l("the cat sat on the mat", "the cat on a mat")
    assert math.isclose(p, 0.8)
    assert math.isclose(r, 4 / 6)
    assert math.isclose(f, 8 / 11)  # 2 * 0.8 * (2/3) / (0.8 + 2/3) = 8/11 ≈ 0.727


def test_rouge_l_order_and_edges():
    assert rouge_l("the cat sat on the mat", "mat the on sat cat the") == (0.5, 0.5, 0.5)
    p, r, _ = rouge_l("the cat on a mat", "the cat sat on the mat")
    assert math.isclose(p, 4 / 6) and math.isclose(r, 0.8)  # 参数对调，P 和 R 互换
    assert rouge_l("a b c", "") == (0.0, 0.0, 0.0)
    assert rouge_l("", "") == (0.0, 0.0, 0.0)
    assert rouge_l("  the  cat ", "the\tcat") == (1.0, 1.0, 1.0)
