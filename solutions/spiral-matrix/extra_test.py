import random

from followup import spiral_at
from solution import spiral_order


def test_followup_matches_full_order():
    matrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]
    assert spiral_at(matrix, 0) == 1
    assert spiral_at(matrix, 4) == 8
    assert spiral_at(matrix, 9) == 5
    assert spiral_at(matrix, 10) == 6
    assert spiral_at(matrix, 11) == 7


def test_followup_random_against_solution():
    rng = random.Random(51)
    for _ in range(300):
        rows, cols = rng.randint(1, 8), rng.randint(1, 8)
        matrix = [[rng.randint(0, 99) for _ in range(cols)] for _ in range(rows)]
        order = spiral_order(matrix)
        assert [spiral_at(matrix, k) for k in range(len(order))] == order


def test_followup_big_matrix_skips_rings():
    n = 2000
    matrix = [[r * n + c for c in range(n)] for r in range(n)]
    # 最里一圈是第 999–1000 行、第 999–1000 列的 2×2，最后读到它的左下角
    assert spiral_at(matrix, n * n - 1) == 1000 * n + 999


def test_followup_out_of_range():
    for k in (-1, 12):
        try:
            spiral_at([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], k)
        except IndexError:
            continue
        raise AssertionError("expected IndexError")
