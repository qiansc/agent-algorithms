export function spiralOrder(matrix: number[][]): number[] {
  if (matrix.some((row) => row.length !== matrix[0].length)) {
    throw new Error('每一行的长度必须相同');
  }
  if (matrix.length === 0 || matrix[0].length === 0) return [];
  // 没读过的部分始终是矩形：行 top..bottom，列 left..right（都含）
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  const result: number[] = [];
  while (top <= bottom && left <= right) {
    // 顶行，向右
    for (let c = left; c <= right; c++) {
      result.push(matrix[top][c]);
    }
    top++;
    // 右列，向下
    for (let r = top; r <= bottom; r++) {
      result.push(matrix[r][right]);
    }
    right--;
    if (top <= bottom) {
      // 底行，向左；只剩一行时，这一行已经读过，不进来
      for (let c = right; c >= left; c--) {
        result.push(matrix[bottom][c]);
      }
      bottom--;
    }
    if (left <= right) {
      // 左列，向上；只剩一列时，这一列已经读过，不进来
      for (let r = bottom; r >= top; r--) {
        result.push(matrix[r][left]);
      }
      left++;
    }
  }
  return result;
}
