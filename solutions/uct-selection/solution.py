import math


def uct_pick(
    children: list[list[float]], c: float = math.sqrt(2)
) -> int:
    """children[i] = [n, W]：访问次数和累计价值。

    按 UCT 分数返回所选孩子的下标。
    """
    if not children:
        raise ValueError("至少要有一个孩子")
    for n, _ in children:
        if n < 0 or n != int(n):
            raise ValueError("访问次数必须是非负整数")
    for i, (n, _) in enumerate(children):
        if n == 0:
            return i  # 没试过的孩子先试，取下标最小的
    parent = sum(n for n, _ in children)
    log_parent = math.log(parent)
    best, best_score = 0, -math.inf
    for i, (n, total) in enumerate(children):
        score = total / n + c * math.sqrt(log_parent / n)
        if score > best_score:  # 严格大于：同分保留下标小的
            best, best_score = i, score
    return best
