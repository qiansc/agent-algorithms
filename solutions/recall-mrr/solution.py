from collections.abc import Hashable, Iterable, Sequence

# 一个查询：(返回的编号列表, 相关编号)
Query = tuple[Sequence[Hashable], Iterable[Hashable]]


def evaluate_rankings(
    cases: Iterable[Query], k: int
) -> tuple[float, float]:
    if k < 0:
        raise ValueError("k must be >= 0")
    recall_sum = rr_sum = 0.0
    count = 0
    for ranking, relevant in cases:
        relevant = set(relevant)
        if not relevant:
            continue  # 没有标注答案的查询不参与平均
        hits = set()  # 命中的不同编号，重复只算一次
        first = 0  # 第一个命中的位置，从 1 数；0 表示没命中
        for pos, doc in enumerate(ranking[:k], start=1):
            if doc in relevant:
                hits.add(doc)
                if first == 0:
                    first = pos
        recall_sum += len(hits) / len(relevant)
        rr_sum += 1 / first if first else 0.0
        count += 1
    if count == 0:
        return (0.0, 0.0)
    return (recall_sum / count, rr_sum / count)
