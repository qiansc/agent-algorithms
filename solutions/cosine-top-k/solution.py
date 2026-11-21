from fractions import Fraction


def cosine_top_k(
    q: list[int], docs: list[list[int]], k: int
) -> list[int]:
    if any(len(vec) != len(q) for vec in docs):
        raise ValueError("文档向量和查询向量维数不同")
    if all(x == 0 for x in q):
        raise ValueError("查询向量不能全为零")
    if k <= 0:
        return []
    scored = []
    for idx, vec in enumerate(docs):
        sq = sum(x * x for x in vec)  # 长度的平方 |v|²
        if sq == 0:
            continue  # 全零向量没有方向，跳过
        dot = sum(x * y for x, y in zip(q, vec))
        # 余弦 = dot / (|q|·|v|)，|q| 对所有文档相同，可以不管。
        # dot / |v| 和它带符号的平方 dot·|dot| / |v|² 次序相同，
        # 后者的分子分母都是整数，能精确比较
        key = Fraction(dot * abs(dot), sq)
        scored.append((-key, idx))
    scored.sort()  # 分数高的在前；分数相等时下标小的在前
    return [idx for _, idx in scored[:k]]
