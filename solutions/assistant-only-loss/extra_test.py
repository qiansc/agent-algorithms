import math
import sys

# 测试脚本会依次加载多道题，先清掉别的题缓存的 followup 模块，用完也清掉
sys.modules.pop("followup", None)
from followup import batch_assistant_loss  # noqa: E402

sys.modules.pop("followup", None)
from solution import assistant_loss  # noqa: E402

LN3 = math.log(3)
A = ([[0, 0], [0, LN3], [LN3, 0], [0, 0]], [-100, -100, 1, 0])  # 2 个有效位置
B = ([[0, 0, 0, 0], [0, 0, 0, 0]], [-100, 2])                     # 1 个有效位置


def test_followup_token_level_mean():
    got = batch_assistant_loss([A, B])
    assert abs(got - 0.6538861686744841) < 1e-12
    assert abs(got - (2 * -math.log(0.75) + math.log(4)) / 3) < 1e-12
    # 按条平均会得到 0.8370，不是这里要的结果
    assert abs(got - 0.8369882167858357) > 0.1


def test_followup_edges():
    assert batch_assistant_loss([]) is None
    assert batch_assistant_loss([([[0, 0]], [-100])]) is None
    assert abs(batch_assistant_loss([A]) - 0.2876820724517809) < 1e-12
    # 没有有效位置的那一条不影响结果
    assert abs(batch_assistant_loss([A, ([[0, 0]], [5])]) - 0.2876820724517809) < 1e-12


def test_large_vocab():
    row = [0.0] * 128256
    assert abs(assistant_loss([row, row], [-100, 5]) - math.log(128256)) < 1e-9
