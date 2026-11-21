import math
from collections import Counter


def bm25_idf_variant(
    docs: list[str],
    query: str,
    classic: bool,
    k1: float = 1.2,
    b: float = 0.75,
) -> list[float]:
    """classic=True：idf = ln((N-df+0.5)/(df+0.5))；否则在括号里加 1。"""
    if k1 < 0 or not 0 <= b <= 1:
        raise ValueError("要求 k1 >= 0 且 0 <= b <= 1")
    tokenized = [d.split() for d in docs]
    n = len(tokenized)
    if n == 0:
        return []
    avgdl = sum(len(tokens) for tokens in tokenized) / n
    if avgdl == 0:
        return [0.0] * n  # 所有文档都是空的，没有词可以命中
    df: Counter[str] = Counter()  # 词 -> 含有它的文档数
    for tokens in tokenized:
        df.update(set(tokens))  # 一篇文档里出现多次也只算一篇
    words = list(dict.fromkeys(query.split()))  # 查询词去重，保留原顺序
    scores = []
    for tokens in tokenized:
        tf = Counter(tokens)
        # 长度系数，平均长度时为 1
        norm = 1 - b + b * len(tokens) / avgdl
        score = 0.0
        for word in words:
            f = tf[word]
            if f == 0:
                continue
            ratio = (n - df[word] + 0.5) / (df[word] + 0.5)
            # 教科书写法在 df > N/2 时 ratio < 1，idf 变成负数
            idf = math.log(ratio) if classic else math.log(1 + ratio)
            score += idf * f * (k1 + 1) / (f + k1 * norm)
        scores.append(score)
    return scores
