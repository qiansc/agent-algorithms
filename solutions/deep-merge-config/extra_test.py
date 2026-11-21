import copy

from followup import deep_merge_with_delete
from solution import deep_merge

BASE = {"model": {"name": "a", "temp": 0.7}, "tools": ["search"], "retry": 1}
OVERRIDE = {"model": {"temp": 0.2, "top_p": 0.9}, "tools": ["db"], "retry": {"max": 3}}


def test_inputs_untouched_and_result_independent():
    base, override = copy.deepcopy(BASE), copy.deepcopy(OVERRIDE)
    result = deep_merge(base, override)
    assert base == BASE and override == OVERRIDE
    # 改结果的任何一层，都不能影响输入
    result["model"]["name"] = "changed"
    result["tools"].append("x")
    result["retry"]["max"] = 9
    assert base == BASE and override == OVERRIDE
    # 只在 base 里的子树也是新对象
    src = {"keep": {"deep": [1]}}
    r3 = deep_merge(src, {})
    r3["keep"]["deep"].append(2)
    assert src == {"keep": {"deep": [1]}}


def test_key_order():
    result = deep_merge({"b": 1, "a": 2}, {"c": 3, "a": 4})
    assert list(result) == ["b", "a", "c"]


def test_shallow_merge_is_wrong():
    # {**base, **override} 只合并第一层，model.name 丢了
    assert {**BASE, **OVERRIDE}["model"] == {"temp": 0.2, "top_p": 0.9}
    assert deep_merge(BASE, OVERRIDE)["model"]["name"] == "a"


def test_followup_null_deletes():
    got = deep_merge_with_delete(BASE, {"model": {"temp": None}, "retry": None})
    assert got == {"model": {"name": "a"}, "tools": ["search"]}
    # base 里没有的键写 null：什么都不做；新子树里的 null 也去掉
    got = deep_merge_with_delete(BASE, {"gone": None, "extra": {"x": None, "y": 1}})
    assert got == {**BASE, "extra": {"y": 1}}
    got = deep_merge_with_delete({"retry": 1}, {"retry": {"max": None, "n": 2}})
    assert got == {"retry": {"n": 2}}
    # 列表里的 None 是普通的值，不删除
    assert deep_merge_with_delete({}, {"a": [None]}) == {"a": [None]}
    # 没有 null 时和原题结果一样
    assert deep_merge_with_delete(BASE, OVERRIDE) == deep_merge(BASE, OVERRIDE)
