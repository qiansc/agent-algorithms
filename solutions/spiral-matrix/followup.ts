/** 顺时针读矩阵时第 k 个读到的数（k 从 0 数起），不生成整个序列。 */
export function spiralAt(matrix: number[][], k: number): number {
  if (matrix.some((row) => row.length !== matrix[0].length)) {
    throw new Error('每一行的长度必须相同');
  }
  const total = matrix.length * (matrix.length ? matrix[0].length : 0);
  if (!Number.isInteger(k) || k < 0 || k >= total) {
    throw new RangeError('k 超出范围');
  }
  let top = 0;
  let bottom = matrix.length - 1;
  let left = 0;
  let right = matrix[0].length - 1;
  let h = 0;
  let w = 0;
  while (true) {
    h = bottom - top + 1;
    w = right - left + 1;
    // 这一圈有几格；只剩一行或一列时，整块就是一圈
    const ring = h === 1 || w === 1 ? h * w : 2 * (h + w) - 4;
    if (k < ring) break;
    k -= ring; // 整圈跳过，进到里面一圈
    top++;
    bottom--;
    left++;
    right--;
  }
  if (k < w) return matrix[top][left + k]; // 顶行 w 格
  k -= w;
  if (k < h - 1) return matrix[top + 1 + k][right]; // 右列 h-1 格
  k -= h - 1;
  if (k < w - 1) return matrix[bottom][right - 1 - k]; // 底行 w-1 格
  k -= w - 1;
  return matrix[bottom - 1 - k][left]; // 左列 h-2 格
}
