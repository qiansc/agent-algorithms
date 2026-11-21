from followup import pack_context_blocks
from solution import pack_context

MSGS = [("system", 4), ("user", 3), ("assistant", 2), ("tool", 9), ("assistant", 5), ("user", 2)]


def test_followup_keeps_call_and_result_together():
    assert pack_context_blocks(MSGS, 20) == ([("system", 4), ("assistant", 5), ("user", 2)], 9)
    assert pack_context_blocks(MSGS, 27) == (MSGS, 2)
    assert pack_context_blocks(MSGS, 4) == ([("system", 4)], 0)


def test_followup_several_results_in_one_block():
    msgs = MSGS[:4] + [("tool", 1)] + MSGS[4:]
    assert pack_context_blocks(msgs, 22) == ([("system", 4), ("assistant", 5), ("user", 2)], 11)
    assert pack_context_blocks(msgs, 26) == (msgs, 0)


def test_original_rule_never_splits_tool_pairs():
    # 原题以 user 开头的规则下，切口只会落在某条 user 之前
    assert pack_context(MSGS, 20) == ([("system", 4), ("user", 2)], 14)


def test_followup_rejects_bad_budget():
    for budget in (3, -1):
        try:
            pack_context_blocks(MSGS, budget)
        except ValueError:
            continue
        raise AssertionError("expected ValueError")
