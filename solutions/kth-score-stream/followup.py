def kth_across_shards(
    shards: list[list[float]], k: int
) -> float | None:
    """每台机器只上报本地最高的 k 个分数，汇总后取第 k 大。"""
    if k < 1:
        raise ValueError("k must be >= 1")
    candidates: list[float] = []
    for scores in shards:
        candidates += sorted(scores, reverse=True)[:k]  # 本地前 k 名
    if len(candidates) < k:
        return None
    return sorted(candidates, reverse=True)[k - 1]
