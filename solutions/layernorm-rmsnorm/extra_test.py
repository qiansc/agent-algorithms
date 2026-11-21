import math
import sys

# 测试脚本会依次加载多道题，先清掉别的题缓存的 followup 模块，用完也清掉
sys.modules.pop("followup", None)
from followup import streaming_mean_var  # noqa: E402

sys.modules.pop("followup", None)
from solution import rms_norm  # noqa: E402


def close(got, want, tol=1e-9):
    return len(got) == len(want) and all(abs(g - w) <= tol for g, w in zip(got, want))


def test_rms_norm_values():
    assert close(rms_norm([1, 2, 3, 4], [1] * 4, 0),
                 [0.3651483716701107, 0.7302967433402214, 1.0954451150103321, 1.4605934866804429])
    # 不减均值：整体加 10 后输出会变
    assert close(rms_norm([11, 12, 13, 14], [1] * 4, 0),
                 [0.8765009801785554, 0.956182887467515, 1.0358647947564745, 1.1155467020454342])
    # 整体乘 3 不变
    assert close(rms_norm([3, 6, 9, 12], [1] * 4, 0), rms_norm([1, 2, 3, 4], [1] * 4, 0))
    assert close(rms_norm([-3], [1], 0), [-1.0])
    assert close(rms_norm([0, 0, 0], [1] * 3), [0.0, 0.0, 0.0])
    assert close(rms_norm([1, 2, 3, 4], [0.5, 1, 2, 0], 0),
                 [0.18257418583505536, 0.7302967433402214, 2.1908902300206643, 0.0])


def test_rms_norm_random():
    x = [1.82, -4.084, 1.178, 3.419, 3.346, 0.15, 1.31, -1.308, 0.28, -3.921, 1.829, 1.007, -2.181, -1.214, 2.361, -0.561]
    g = [1.46, 1.471, 1.338, 0.591, 0.575, 0.789, 0.861, 1.205, 1.327, 1.063, 1.139, 1.073, 0.534, 1.027, 0.713, 0.917]
    want = [1.19097820137913, -2.6926380277698367, 0.7064492570369316, 0.9056620096622422, 0.8623297119311217, 0.05304541251438357, 0.5055382444368262, -0.7064385000458008, 0.1665361510253009, -1.868141101854149, 0.9337207246113376, 0.48429363516120905, -0.5220071978582753, -0.5588158286764522, 0.7545101487860221, -0.23057476026752802]
    assert close(rms_norm(x, g, 1e-6), want)
    # 逐项核对定义
    rms = math.sqrt(sum(t * t for t in x) / len(x) + 1e-6)
    assert close(rms_norm(x, g, 1e-6), [gi * t / rms for t, gi in zip(x, g)])


def test_rms_norm_errors():
    for args in ([[], []], [[1, 2], [1]], [[0, 0], [1, 1], 0], [[1, 2], [1, 1], -1e-6]):
        try:
            rms_norm(*args)
        except ValueError:
            continue
        raise AssertionError(f"expected ValueError for {args}")


def test_followup_streaming_mean_var():
    assert streaming_mean_var([1, 2, 3, 4]) == (2.5, 1.25)
    # 一遍公式 E[x^2] - mean^2 在这里会得到 2.0
    assert streaming_mean_var([1e8 + 1, 1e8 + 2, 1e8 + 3, 1e8 + 4]) == (100000002.5, 1.25)
    assert streaming_mean_var([7]) == (7.0, 0.0)
    assert streaming_mean_var(iter([3, 3, 3])) == (3.0, 0.0)
    try:
        streaming_mean_var([])
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError")
