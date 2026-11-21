from followup import islands_after_adds
from solution import islands


def test_long_snake_without_recursion():
    # 300×300 的蛇形通道，一座岛有 4 万多格；递归 DFS 在 Python 里会超过默认深度上限
    n = 300
    grid = [[0] * n for _ in range(n)]
    for r in range(0, n, 2):
        grid[r] = [1] * n
        if r + 1 < n:
            grid[r + 1][n - 1 if r % 4 == 0 else 0] = 1
    land = sum(map(sum, grid))
    assert islands(grid) == (1, land)


def test_followup_union_find():
    # 第 4 步加 (1,1)：上邻 (0,1) 和左邻 (1,0) 已经是同一座岛，只能减一次
    assert islands_after_adds(3, 3, [(0, 1), (1, 0), (0, 0), (1, 1), (2, 2)]) == [1, 2, 1, 1, 2]
    # 中心格把四座岛连成一座
    assert islands_after_adds(3, 3, [(0, 1), (1, 0), (1, 2), (2, 1), (1, 1)]) == [1, 2, 3, 4, 1]
    # 重复加同一格，岛数不变
    assert islands_after_adds(2, 2, [(0, 0), (0, 0), (1, 1)]) == [1, 1, 2]
    assert islands_after_adds(2, 2, []) == []


def test_followup_matches_bfs():
    import random

    rng = random.Random(54)
    for _ in range(300):
        rows, cols = rng.randint(1, 6), rng.randint(1, 6)
        positions = [(rng.randrange(rows), rng.randrange(cols)) for _ in range(rng.randint(0, 20))]
        grid = [[0] * cols for _ in range(rows)]
        expected = []
        for r, c in positions:
            grid[r][c] = 1
            expected.append(islands(grid)[0])
        assert islands_after_adds(rows, cols, positions) == expected


def test_followup_out_of_grid():
    try:
        islands_after_adds(2, 2, [(2, 0)])
    except ValueError:
        return
    raise AssertionError("expected ValueError")
