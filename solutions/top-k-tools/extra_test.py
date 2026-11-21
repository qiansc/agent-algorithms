import random
from collections import Counter

from followup import top_tools_heap
from solution import top_tools


def test_followup_sample():
    assert top_tools_heap(["web", "db", "db", "mail", "web", "calc"], 3) == ["db", "web", "calc"]
    assert top_tools_heap(["web", "db", "db", "mail", "web", "calc"], 10) == ["db", "web", "calc", "mail"]
    assert top_tools_heap(["web"], 0) == []
    assert top_tools_heap([], 2) == []


def test_followup_late_burst():
    # 前面只出现一次的 z，最后连续出现，最终必须是第一名
    calls = ["a", "a", "b", "b", "z"] + ["z"] * 5
    assert top_tools_heap(calls, 1) == ["z"]


def test_followup_matches_sorting():
    rng = random.Random(7)
    for _ in range(200):
        calls = [rng.choice("abcdefgh") for _ in range(rng.randint(0, 40))]
        k = rng.randint(0, 9)
        assert top_tools_heap(calls, k) == top_tools(calls, k)
