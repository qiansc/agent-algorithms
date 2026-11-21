def auc(scores: list[float], labels: list[int]) -> float:
    n = len(scores)
    if len(labels) != n:
        raise ValueError("scores and labels must have the same length")
    if any(y not in (0, 1) for y in labels):
        raise ValueError("labels must be 0 or 1")
    if any(s != s for s in scores):  # NaN 不等于自己，无法排序
        raise ValueError("scores must not be NaN")
    pos = sum(labels)
    neg = n - pos
    if pos == 0 or neg == 0:
        raise ValueError("need at least one positive and one negative")

    # 下标按分数从低到高排
    order = sorted(range(n), key=lambda i: scores[i])
    pos_rank_sum = 0.0
    i = 0
    while i < n:
        j = i
        while j < n and scores[order[j]] == scores[order[i]]:
            j += 1
        # order[i:j] 分数相同，占名次 i+1 … j，每个都记平均名次
        avg_rank = (i + 1 + j) / 2
        pos_in_group = sum(labels[order[t]] for t in range(i, j))
        pos_rank_sum += avg_rank * pos_in_group
        i = j

    # Mann–Whitney U：正样本名次和减去正样本内部互比的部分
    u = pos_rank_sum - pos * (pos + 1) / 2
    return u / (pos * neg)
