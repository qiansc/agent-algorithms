import math

from solution import uct_pick


def uct_rounds(
    children: list[list[float]],
    rewards: list[float],
    c: float = math.sqrt(2),
) -> list[int]:
    """每一轮用 UCT 选一个孩子，再把 rewards 里的下一个奖励回传给它。

    回传就是 n 加 1、W 加上奖励。返回每一轮选中的下标。
    """
    stats = [[n, w] for n, w in children]  # 复制一份，不改调用方的列表
    picks = []
    for reward in rewards:
        i = uct_pick(stats, c)
        stats[i][0] += 1
        stats[i][1] += reward
        picks.append(i)
    return picks
