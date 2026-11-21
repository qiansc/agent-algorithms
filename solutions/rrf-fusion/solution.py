from collections import defaultdict
from fractions import Fraction


def fuse_ranks(ranks: list[list[int]], k: int, c: int = 60) -> list[int]:
    if not isinstance(c, int) or c < 1:
        raise ValueError("c 必须是正整数")
    if k < 0:
        raise ValueError("k 不能是负数")
    if k == 0:
        return []
    # 用分数精确累加：数学上相等的总分一定比较为相等，并列才能按编号排
    scores: dict[int, Fraction] = defaultdict(Fraction)
    for ranking in ranks:
        for pos, doc in enumerate(ranking, start=1):  # 名次从 1 数
            scores[doc] += Fraction(1, c + pos)
    return sorted(scores, key=lambda doc: (-scores[doc], doc))[:k]
