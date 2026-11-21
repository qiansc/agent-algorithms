from collections.abc import Iterable

from solution import Query


def micro_recall(cases: Iterable[Query], k: int) -> float:
    """每条相关文档算一票：命中数之和 ÷ 标注数之和。"""
    if k < 0:
        raise ValueError("k must be >= 0")
    hit_total = relevant_total = 0
    for ranking, relevant in cases:
        relevant = set(relevant)
        hit_total += len(relevant.intersection(ranking[:k]))
        relevant_total += len(relevant)
    return hit_total / relevant_total if relevant_total else 0.0
