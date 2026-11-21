import random
import sys

# 测试脚本会依次加载多道题，先清掉别的题缓存的 followup 模块，用完也清掉
sys.modules.pop("followup", None)
from followup import lora_grads  # noqa: E402

sys.modules.pop("followup", None)
from solution import LoRALinear, matvec  # noqa: E402


def close(a, b, tol=1e-9):
    if isinstance(a, list):
        return len(a) == len(b) and all(close(x, y, tol) for x, y in zip(a, b))
    return abs(a - b) <= tol


def test_shape_errors():
    bad = [
        ([], [[1]], [], 1),                      # W 为空
        ([[1, 0], [0, 1]], [], [[], []], 1),     # r = 0
        ([[1, 0], [0, 1]], [[1, 1, 1]], [[0], [0]], 1),  # A 列数不对
        ([[1, 0], [0, 1]], [[1, 1]], [[0]], 1),         # B 行数不对
        ([[1, 0], [0, 1]], [[1, 1]], [[0, 0], [0, 0]], 1),  # B 列数不对
    ]
    for args in bad:
        try:
            LoRALinear(*args)
        except ValueError:
            continue
        raise AssertionError(f"expected ValueError for {args}")
    layer = LoRALinear([[1, 0], [0, 1]], [[1, 1]], [[2], [0]], 2)
    try:
        layer.forward([1, 2, 3])
    except ValueError:
        pass
    else:
        raise AssertionError("expected ValueError for wrong x length")


def test_merge_matches_forward_random():
    rng = random.Random(41)
    for _ in range(20):
        d, k, r = rng.randint(1, 6), rng.randint(1, 6), rng.randint(1, 3)
        W = [[rng.uniform(-1, 1) for _ in range(k)] for _ in range(d)]
        A = [[rng.uniform(-1, 1) for _ in range(k)] for _ in range(r)]
        B = [[rng.uniform(-1, 1) for _ in range(r)] for _ in range(d)]
        x = [rng.uniform(-2, 2) for _ in range(k)]
        layer = LoRALinear(W, A, B, rng.choice([1, 8, 16]))
        assert close(layer.forward(x), matvec(layer.merge(), x))


def test_followup_grads():
    # B = 0、A 随机：B 先拿到梯度
    gA, gB = lora_grads([[1, 1]], [[0], [0]], 2, [1, 2], [1, 0])
    assert close(gA, [[0, 0]]) and close(gB, [[6], [0]])
    # A、B 都为 0：两个梯度都是 0，训练动不了
    gA, gB = lora_grads([[0, 0]], [[0], [0]], 2, [1, 2], [1, 0])
    assert close(gA, [[0, 0]]) and close(gB, [[0], [0]])
    # B 走了一步之后，A 也有了梯度
    gA, gB = lora_grads([[1, 1]], [[-0.6], [0]], 2, [1, 2], [1, 0])
    assert close(gA, [[-1.2, -2.4]]) and close(gB, [[6], [0]])
