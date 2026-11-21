import math


def capped_cost(
    n: int,
    edges: list[tuple[int, int, int]],
    src: int,
    dst: int,
    limit: int,
) -> int:
    if n <= 0 or limit < 0 or not (0 <= src < n and 0 <= dst < n):
        raise ValueError(
            "n 必须为正，limit 不能为负，起点终点要在 0..n-1 之间"
        )
    for u, v, cost in edges:
        if not (0 <= u < n and 0 <= v < n) or cost < 0:
            raise ValueError(f"非法的边 {(u, v, cost)}")

    # previous[v]：最多走 k 条边到 v 的最低价，这里 k 是已经做完的层数
    previous = [math.inf] * n
    previous[src] = 0
    for _ in range(limit):
        # 少走一步也算“最多 k 步”，先整层抄下来
        current = previous.copy()
        for u, v, cost in edges:
            # 只能从上一层出发，否则一轮里可能连走好几条边
            current[v] = min(current[v], previous[u] + cost)
        # 这一层什么都没变，后面也不会变
        if current == previous:
            break
        previous = current
    return -1 if previous[dst] == math.inf else int(previous[dst])
