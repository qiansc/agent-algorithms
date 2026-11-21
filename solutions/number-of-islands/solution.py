from collections import deque


def islands(grid: list[list[int]]) -> tuple[int, int]:
    """返回 (岛屿数量, 最大岛屿的格子数)。"""
    if any(len(row) != len(grid[0]) for row in grid):
        raise ValueError("每一行的长度必须相同")
    if any(v not in (0, 1) for row in grid for v in row):
        raise ValueError("格子只能是 0 或 1")
    if not grid or not grid[0]:
        return 0, 0
    rows, cols = len(grid), len(grid[0])
    seen = [[False] * cols for _ in range(rows)]
    count = best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] != 1 or seen[r][c]:
                continue
            count += 1  # 碰到一块没访问过的陆地：一座新岛
            area = 0
            seen[r][c] = True
            queue = deque([(r, c)])
            while queue:
                x, y = queue.popleft()
                area += 1
                for nx, ny in ((x + 1, y), (x - 1, y),
                               (x, y + 1), (x, y - 1)):
                    if (0 <= nx < rows and 0 <= ny < cols
                            and grid[nx][ny] == 1 and not seen[nx][ny]):
                        # 入队时就标记，同一格不会进队两次
                        seen[nx][ny] = True
                        queue.append((nx, ny))
            best = max(best, area)
    return count, best
