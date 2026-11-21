import math


def info_nce_with_ids(
    queries: list[list[float]],
    docs: list[list[float]],
    doc_ids: list[int],
    tau: float,
) -> float:
    n = len(queries)
    if n == 0 or len(docs) != n or len(doc_ids) != n:
        raise ValueError("queries、docs、doc_ids 必须等长且非空")
    if tau <= 0:
        raise ValueError("tau 必须大于 0")

    def unit(v: list[float]) -> list[float]:
        norm = math.sqrt(sum(x * x for x in v))
        if norm == 0:
            raise ValueError("零向量没有方向，无法归一化")
        return [x / norm for x in v]

    qs = [unit(v) for v in queries]
    ds = [unit(v) for v in docs]
    total = 0.0
    for i, q in enumerate(qs):
        # 和正确文档编号相同的其他列是假负例，不进分母
        logits = [
            sum(a * b for a, b in zip(q, d)) / tau
            for j, d in enumerate(ds)
            if j == i or doc_ids[j] != doc_ids[i]
        ]
        target = sum(a * b for a, b in zip(q, ds[i])) / tau
        peak = max(logits)
        log_sum = peak + math.log(
            sum(math.exp(z - peak) for z in logits)
        )
        total += log_sum - target
    return total / n
