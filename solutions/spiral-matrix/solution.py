def spiral_order(matrix: list[list[int]]) -> list[int]:
    if any(len(row) != len(matrix[0]) for row in matrix):
        raise ValueError("每一行的长度必须相同")
    if not matrix or not matrix[0]:
        return []
    # 没读过的部分始终是矩形：行 top..bottom，列 left..right（都含）
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    result = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):          # 顶行，向右
            result.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):          # 右列，向下
            result.append(matrix[r][right])
        right -= 1
        if top <= bottom:
            # 底行，向左；只剩一行时，这一行已经读过，不进来
            for c in range(right, left - 1, -1):
                result.append(matrix[bottom][c])
            bottom -= 1
        if left <= right:
            # 左列，向上；只剩一列时，这一列已经读过，不进来
            for r in range(bottom, top - 1, -1):
                result.append(matrix[r][left])
            left += 1
    return result
