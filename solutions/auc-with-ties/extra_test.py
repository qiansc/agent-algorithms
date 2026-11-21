import random

from followup import gauc
from solution import auc


def auc_brute(scores: list[float], labels: list[int]) -> float:
    """O(P·N) 定义法：逐对比较，并列记 0.5。只用来对拍。"""
    pos = [s for s, y in zip(scores, labels) if y == 1]
    neg = [s for s, y in zip(scores, labels) if y == 0]
    wins = sum(1.0 if p > q else 0.5 if p == q else 0.0 for p in pos for q in neg)
    return wins / (len(pos) * len(neg))


def test_matches_brute_force():
    rng = random.Random(42)
    for _ in range(500):
        n = rng.randint(2, 30)
        labels = [rng.randint(0, 1) for _ in range(n)]
        if len(set(labels)) < 2:
            labels[0], labels[1] = 0, 1
        scores = [rng.randint(0, 5) / 5 for _ in range(n)]  # 取值很少，并列很多
        assert abs(auc(scores, labels) - auc_brute(scores, labels)) < 1e-12


def test_order_of_input_does_not_matter():
    scores = [0.9, 0.8, 0.8, 0.6, 0.3, 0.3]
    labels = [1, 1, 0, 0, 1, 0]
    rng = random.Random(1)
    for _ in range(50):
        idx = list(range(6))
        rng.shuffle(idx)
        assert abs(auc([scores[i] for i in idx], [labels[i] for i in idx]) - 2 / 3) < 1e-12


def test_followup_gauc():
    users = ["u1", "u1", "u1", "u2", "u2", "u2", "u2", "u3", "u3"]
    scores = [0.9, 0.8, 0.8, 0.4, 0.3, 0.2, 0.1, 0.95, 0.05]
    labels = [1, 1, 0, 1, 1, 0, 0, 0, 0]
    assert abs(gauc(users, scores, labels) - 25 / 28) < 1e-12
    assert abs(auc(scores, labels) - 27 / 40) < 1e-12  # 不分用户的整体 AUC
    for bad in (["a", "a"], ["a", "b"]):
        try:
            gauc(bad, [0.1, 0.2], [1, 0] if bad == ["a", "b"] else [1, 1])
        except ValueError:
            continue
        raise AssertionError("expected ValueError")
