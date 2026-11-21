from collections.abc import Sequence
from typing import TypeVar

T = TypeVar("T")


def lcs(a: Sequence[T], b: Sequence[T]) -> tuple[int, list[T]]:
    m, n = len(a), len(b)
    # dp[i][j]：a 的前 i 个元素和 b 的前 j 个元素的最长公共子序列长度
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # 从右下角往回走，把走斜线时经过的元素收集起来
    out: list[T] = []
    i, j = m, n
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:  # 相等时往上走
            i -= 1
        else:
            j -= 1
    out.reverse()
    return dp[m][n], out
