def islands_after_adds(
    rows: int, cols: int, positions: list[tuple[int, int]]
) -> list[int]:
    """一开始全是水；每把一格变成陆地，就报告一次当前岛屿数。"""
    parent: dict[int, int] = {}  # 陆地格编号 r * cols + c -> 父节点
    size: dict[int, int] = {}

    def find(a: int) -> int:
        while parent[a] != a:
            parent[a] = parent[parent[a]]  # 路径减半：挂到祖父下面
            a = parent[a]
        return a

    count = 0
    result = []
    for r, c in positions:
        if not (0 <= r < rows and 0 <= c < cols):
            raise ValueError("位置超出网格")
        cell = r * cols + c
        if cell in parent:  # 已经是陆地，岛数不变
            result.append(count)
            continue
        parent[cell], size[cell] = cell, 1
        count += 1  # 先当成一座新岛
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if not (0 <= nr < rows and 0 <= nc < cols):
                continue
            other = nr * cols + nc
            if other not in parent:  # 邻居是水
                continue
            a, b = find(cell), find(other)
            if a == b:  # 这个邻居已经和自己在同一座岛里，不能再减
                continue
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a  # 小的挂到大的下面
            size[a] += size[b]
            count -= 1  # 两座岛合成一座
        result.append(count)
    return result
