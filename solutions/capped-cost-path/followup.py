import math


def capped_cost_path(
    n: int,
    edges: list[tuple[int, int, int]],
    src: int,
    dst: int,
    limit: int,
) -> tuple[int, list[int]]:
    """返回 (最低价, 状态序列)；到不了返回 (-1, [])。"""
    if n <= 0 or limit < 0 or not (0 <= src < n and 0 <= dst < n):
        raise ValueError(
            "n 必须为正，limit 不能为负，起点终点要在 0..n-1 之间"
        )
    for u, v, cost in edges:
        if not (0 <= u < n and 0 <= v < n) or cost < 0:
            raise ValueError(f"非法的边 {(u, v, cost)}")

    # 每一层都留下来：layers[k][v] 是最多 k 步到 v 的最低价
    layers = [[math.inf] * n]
    layers[0][src] = 0
    for _ in range(limit):
        previous = layers[-1]
        current = previous.copy()
        for u, v, cost in edges:
            current[v] = min(current[v], previous[u] + cost)
        layers.append(current)

    if layers[limit][dst] == math.inf:
        return -1, []
    # 从第 limit 层的 dst 往回找：
    # 这一格的价钱要么是上一层抄下来的，要么来自某条边
    path = [dst]
    v, k = dst, limit
    while k > 0:
        if layers[k - 1][v] == layers[k][v]:
            k -= 1  # 少走一步就能拿到同样的价钱，留在原地退一层
            continue
        for u, w, cost in edges:
            if w == v and layers[k - 1][u] + cost == layers[k][v]:
                v, k = u, k - 1
                path.append(v)
                break
    path.reverse()
    return int(layers[limit][dst]), path
