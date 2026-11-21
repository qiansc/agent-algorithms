import math


def mmr(
    query_sim: list[float],
    pair_sim: list[list[float]],
    k: int,
    lam: float,
) -> list[int]:
    n = len(query_sim)
    if not 0 <= lam <= 1:
        raise ValueError("lam 必须在 0 到 1 之间")
    if len(pair_sim) != n or any(len(row) != n for row in pair_sim):
        raise ValueError("pair_sim 必须是 n × n 的矩阵")
    if k <= 0 or n == 0:
        return []
    chosen: list[int] = []
    picked = [False] * n
    # redundancy[i]：片段 i 与所有已选片段相似度的最大值
    redundancy = [-math.inf] * n
    while len(chosen) < min(k, n):
        best, best_score = -1, -math.inf
        for i in range(n):
            if picked[i]:
                continue
            if chosen:
                score = lam * query_sim[i] - (1 - lam) * redundancy[i]
            else:
                score = query_sim[i]  # 第一轮只看相关度
            if score > best_score:  # 严格大于：同分时保留下标小的
                best, best_score = i, score
        chosen.append(best)
        picked[best] = True
        # 只需和新选中的这一个比，就能保持“与所有已选的最大值”
        for i in range(n):
            if not picked[i]:
                redundancy[i] = max(redundancy[i], pair_sim[i][best])
    return chosen
