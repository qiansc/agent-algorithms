from solution import auc


def gauc(
    users: list[str], scores: list[float], labels: list[int]
) -> float:
    """按用户分组各算 AUC，再按每个用户的样本数加权平均。"""
    if not len(users) == len(scores) == len(labels):
        raise ValueError("inputs must have the same length")
    groups: dict[str, list[int]] = {}
    for i, user in enumerate(users):
        groups.setdefault(user, []).append(i)
    weighted = total = 0.0
    for idx in groups.values():
        ys = [labels[i] for i in idx]
        if all(ys) or not any(ys):
            continue  # 只有一种标签，这个用户算不出 AUC，跳过
        weighted += len(idx) * auc([scores[i] for i in idx], ys)
        total += len(idx)
    if total == 0:
        raise ValueError("no user has both positives and negatives")
    return weighted / total
