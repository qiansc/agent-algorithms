from followup import micro_recall
from solution import evaluate_rankings

BIG = [([1, 500, 501], set(range(1, 101))), ([7], {7})]


def test_followup_macro_vs_micro():
    macro_recall, _ = evaluate_rankings(BIG, 3)
    assert abs(macro_recall - 0.505) < 1e-12
    assert abs(micro_recall(BIG, 3) - 2 / 101) < 1e-12
    sample = [([8, 2, 2, 7], {2, 7}), ([5, 3], {5}), ([4], set())]
    assert abs(micro_recall(sample, 3) - 2 / 3) < 1e-12
    assert micro_recall([([1], set())], 3) == 0.0


def test_sets_and_tuples_accepted():
    assert evaluate_rankings([((8, 2, 2, 7), frozenset({2, 7}))], 3) == (0.5, 0.5)
    assert evaluate_rankings([(["a", "b"], {"b"})], 2) == (1.0, 0.5)


def test_wrong_variants_differ():
    # 正文里提到的三种错误写法，各自会得到什么
    sample = [([8, 2, 2, 7], {2, 7}), ([5, 3], {5}), ([4], set())]
    assert evaluate_rankings(sample, 3) == (0.75, 0.75)
    assert evaluate_rankings(sample, 4) == (1.0, 0.75)  # 忘了截断到前 k 个
    pos_hits = (2 / 2 + 1) / 2  # 重复的 2 算两次命中
    assert pos_hits == 1.0
    with_empty = ((0.5 + 1) / 3, (0.5 + 1) / 3)  # 空标注当作 0 分也计入
    assert with_empty == (0.5, 0.5)
