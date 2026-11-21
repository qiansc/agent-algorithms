import itertools

from solution import beam_plan

TREE = {
    (): [("A", -1), ("B", -2), ("C", -4)],
    ("A",): [("X", -8), ("Y", -3)],
    ("B",): [("Y", -1), ("Z", -2)],
    ("C",): [("W", 0)],
    ("A", "X"): [("Q", 0)],
    ("A", "Y"): [("Q", -1)],
    ("B", "Y"): [("Q", -6)],
    ("B", "Z"): [("Q", -1)],
}


def _score(path):
    # 一棵每个节点都有 a、b、c 三个孩子的树，增量分由路径算出，范围 -5..5
    return (sum(ord(ch) * (i + 3) for i, ch in enumerate(path)) * 7919) % 11 - 5


def _generated(path):
    return [(ch, _score(path + (ch,))) for ch in "abc"]


def test_expand_called_only_on_kept_paths_in_order():
    calls = []

    def expand(path):
        calls.append(path)
        return TREE.get(path, [])

    assert beam_plan(expand, 3, 2) == (("A", "Y", "Q"), -5)
    # 第 2 层保留的是 B→Y（−3）和 A→Y（−4），按这个顺序展开
    assert calls == [(), ("A",), ("B",), ("B", "Y"), ("A", "Y")]


def test_expand_receives_hashable_tuples_and_iterators_work():
    def expand(path):
        assert isinstance(path, tuple)
        return iter(TREE.get(path, []))  # 回调返回迭代器也可以

    assert beam_plan(expand, 2, 2) == (("B", "Y"), -3)


def test_wide_beam_equals_exhaustive_search():
    for depth in range(5):
        best = max(
            sum(_score(p[: i + 1]) for i in range(depth))
            for p in itertools.product("abc", repeat=depth)
        )
        path, total = beam_plan(_generated, depth, 3**depth)
        assert total == best
        assert total == sum(_score(path[: i + 1]) for i in range(depth))


def test_width_one_is_greedy():
    path, total = beam_plan(_generated, 4, 1)
    greedy, acc = (), 0
    for _ in range(4):
        # max 遇到同分返回第一个，与“同分保留先生成的”一致
        action, inc = max(_generated(greedy), key=lambda m: m[1])
        greedy, acc = greedy + (action,), acc + inc
    assert (path, total) == (greedy, acc)


def test_invalid_arguments():
    for depth, width in ((2, 0), (-1, 1)):
        try:
            beam_plan(lambda p: TREE.get(p, []), depth, width)
        except ValueError:
            continue
        raise AssertionError("应当抛出 ValueError")
