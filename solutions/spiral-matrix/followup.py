def spiral_at(matrix: list[list[int]], k: int) -> int:
    """顺时针读矩阵时第 k 个读到的数（k 从 0 数起），不生成整个序列。"""
    if any(len(row) != len(matrix[0]) for row in matrix):
        raise ValueError("每一行的长度必须相同")
    total = len(matrix) * (len(matrix[0]) if matrix else 0)
    if not 0 <= k < total:
        raise IndexError("k 超出范围")
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while True:
        h, w = bottom - top + 1, right - left + 1
        # 这一圈有几格；只剩一行或一列时，整块就是一圈
        ring = h * w if h == 1 or w == 1 else 2 * (h + w) - 4
        if k < ring:
            break
        k -= ring  # 整圈跳过，进到里面一圈
        top, bottom = top + 1, bottom - 1
        left, right = left + 1, right - 1
    if k < w:                                     # 顶行 w 格
        return matrix[top][left + k]
    k -= w
    if k < h - 1:                                 # 右列 h-1 格
        return matrix[top + 1 + k][right]
    k -= h - 1
    if k < w - 1:                                 # 底行 w-1 格
        return matrix[bottom][right - 1 - k]
    k -= w - 1
    return matrix[bottom - 1 - k][left]           # 左列 h-2 格
