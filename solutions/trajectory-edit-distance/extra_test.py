import random

from followup import trace_edits
from solution import trace_distance


def apply(a: list[str], edits) -> list[str]:
    out = []
    pos = 0
    for op, src, dst in edits:
        if op == "insert":
            out.append(dst)
            continue
        assert a[pos] == src
        pos += 1
        if op != "delete":
            out.append(dst)
    assert pos == len(a)
    return out


def test_followup_sample_edits():
    a = ["查票", "查票", "付款"]
    b = ["查票", "确认", "付款"]
    assert trace_edits(a, b) == [("keep", "查票", "查票"), ("replace", "查票", "确认"), ("keep", "付款", "付款")]
    assert trace_edits(["搜索", "查票", "付款"], ["查票", "付款", "搜索"]) == [
        ("delete", "搜索", None),
        ("keep", "查票", "查票"),
        ("keep", "付款", "付款"),
        ("insert", None, "搜索"),
    ]
    assert trace_edits([], []) == []
    assert trace_edits(["查票"], []) == [("delete", "查票", None)]


def test_followup_edits_are_valid_and_shortest():
    rng = random.Random(48)
    tools = ["搜索", "查票", "付款", "确认"]
    for _ in range(300):
        a = [rng.choice(tools) for _ in range(rng.randint(0, 7))]
        b = [rng.choice(tools) for _ in range(rng.randint(0, 7))]
        edits = trace_edits(a, b)
        assert apply(a, edits) == b
        assert sum(op != "keep" for op, _, _ in edits) == trace_distance(a, b)
