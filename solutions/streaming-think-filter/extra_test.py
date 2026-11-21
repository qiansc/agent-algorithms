import random
import re

from followup import TagFilter, think_filter, tool_call_filter
from solution import ThinkFilter


def run(f, chunks):
    return [f.feed(c) for c in chunks] + [f.close()]


def reference(text, start, end, keep_inside):
    """整段文本一次性处理的结果，用来对拍。"""
    pieces = []
    pos, inside = 0, False
    while True:
        tag = end if inside else start
        i = text.find(tag, pos)
        if i < 0:
            if inside == keep_inside:
                pieces.append(text[pos:])
            return "".join(pieces)
        if inside == keep_inside:
            pieces.append(text[pos:i])
        pos, inside = i + len(tag), not inside


def test_tool_call_sample():
    chunks = ["查一下。<tool_", 'call>{"q": 1}</tool', "_call>好的"]
    assert run(tool_call_filter(), chunks) == ["", '{"q": 1}', "", ""]


def test_tool_call_blocks_are_concatenated():
    text = "<tool_call>a</tool_call>x<tool_call>b</tool_call>"
    assert run(tool_call_filter(), [text]) == ["ab", ""]


def test_tool_call_outside_tail_dropped():
    assert run(tool_call_filter(), ["a <tool"]) == ["", ""]


def test_think_filter_same_as_main():
    for chunks in (["Hi <th", "ink>secret</thi", "nk> there"], ["1 < 2 <"]):
        assert run(think_filter(), chunks) == run(ThinkFilter(), chunks)


def test_reference_matches_regex():
    text = "a<think>x</think>b<think>y"
    # 正则去掉成对的块，再截掉没闭合的 <think> 之后的部分
    whole = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
    assert reference(text, "<think>", "</think>", False) == whole.split("<think>")[0] == "ab"


def test_random_chunking_both_modes():
    rng = random.Random(50)
    for start, end in (("<think>", "</think>"), ("<tool_call>", "</tool_call>")):
        alphabet = list(set(start + end + "ab "))
        for _ in range(300):
            parts = []
            for _ in range(rng.randint(0, 12)):
                r = rng.random()
                if r < 0.2:
                    parts.append(start)
                elif r < 0.4:
                    parts.append(end)
                else:
                    parts.append("".join(rng.choice(alphabet) for _ in range(rng.randint(1, 5))))
            text = "".join(parts)
            chunks, i = [], 0
            while i < len(text):
                k = rng.randint(1, 6)
                chunks.append(text[i:i + k])
                i += k
            for keep_inside in (False, True):
                got = "".join(run(TagFilter(start, end, keep_inside), chunks))
                assert got == reference(text, start, end, keep_inside), (text, chunks)


def test_empty_tag_rejected():
    try:
        TagFilter("", "</x>", True)
    except ValueError:
        return
    raise AssertionError("应当抛出 ValueError")
