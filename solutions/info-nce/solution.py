import math


def info_nce(
    queries: list[list[float]], docs: list[list[float]], tau: float
) -> float:
    n = len(queries)
    if n == 0 or len(docs) != n:
        raise ValueError("queries 和 docs 必须等长且非空")
    if tau <= 0:
        raise ValueError("tau 必须大于 0")
    dim = len(queries[0])
    if any(len(v) != dim for v in queries + docs):
        raise ValueError("所有向量的维数必须相同")

    def unit(v: list[float]) -> list[float]:
        norm = math.sqrt(sum(x * x for x in v))
        if norm == 0:
            raise ValueError("零向量没有方向，无法归一化")
        return [x / norm for x in v]

    qs = [unit(v) for v in queries]
    ds = [unit(v) for v in docs]
    total = 0.0
    for i, q in enumerate(qs):
        # 第 i 行：查询 i 与每篇文档的余弦相似度，再除以温度
        logits = [sum(a * b for a, b in zip(q, d)) / tau for d in ds]
        peak = max(logits)  # 先减去最大值，exp 不会溢出
        log_sum = peak + math.log(
            sum(math.exp(z - peak) for z in logits)
        )
        total += log_sum - logits[i]  # -log softmax(logits)[i]
    return total / n
