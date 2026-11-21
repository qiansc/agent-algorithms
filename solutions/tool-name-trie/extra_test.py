from followup import allowed_tokens
from solution import ToolNames


def test_invalid_names_rejected():
    for bad in (["go", ""], ["Go"], ["get_weather"], ["搜索"]):
        try:
            ToolNames(bad)
        except ValueError:
            continue
        raise AssertionError(f"应当拒绝 {bad!r}")


def test_result_is_fresh_list():
    t = ToolNames(["go", "gone", "get"])
    chars, _ = t.allowed("g")
    chars.append("z")
    assert t.allowed("g") == (["e", "o"], False)


def test_followup_multi_char_tokens():
    t = ToolNames(["go", "gone", "get"])
    vocab = ["o", "one", "et", "e", "ox", "on", "", "n"]
    # ox 的首字母 o 合法，但 x 走不通
    assert allowed_tokens(t, "g", vocab) == ["e", "et", "o", "on", "one"]
    assert allowed_tokens(t, "go", ["ne", "nex", "n", "e"]) == ["n", "ne"]
    assert allowed_tokens(t, "x", ["a"]) == []
    assert allowed_tokens(t, "gone", ["s"]) == []
    # 词表里有重复，只返回一次
    assert allowed_tokens(t, "", ["go", "go", "ge"]) == ["ge", "go"]
